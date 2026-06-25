from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.db.models import Sum

from apps.files.models import FileRecord
from apps.files.validators import detect_file_mime, validate_upload_file
from core.exceptions import StorageQuotaExceeded
from services.audit_service import AuditService
from storage.local import LocalFileStorage


class FileService:
    def __init__(self, storage: LocalFileStorage | None = None):
        self.storage = storage or LocalFileStorage()

    @transaction.atomic
    def upload(self, user, uploaded_file) -> FileRecord:
        validate_upload_file(uploaded_file)

        stats = self.get_stats(user)
        if stats["storage_used"] + uploaded_file.size > settings.MAX_STORAGE_QUOTA_BYTES:
            raise StorageQuotaExceeded()

        storage_name = self.storage.generate_storage_name(uploaded_file.name)
        try:
            self.storage.save(user.id, storage_name, uploaded_file)
            mime_type = detect_file_mime(uploaded_file)

            record = FileRecord.objects.create(
                owner=user,
                original_filename=Path(uploaded_file.name).name,
                storage_filename=storage_name,
                mime_type=mime_type,
                size=uploaded_file.size,
            )
        except Exception:
            self.storage.delete(user.id, storage_name)
            raise

        AuditService.log_upload(user, record)
        return record

    def get_user_file(self, user, file_id) -> FileRecord | None:
        return FileRecord.objects.filter(id=file_id, owner=user).first()

    def list_user_files(self, user):
        return FileRecord.objects.filter(owner=user)

    def get_storage_path(self, file_record: FileRecord):
        return self.storage.get_path(file_record.owner_id, file_record.storage_filename)

    @transaction.atomic
    def delete(self, user, file_record: FileRecord) -> None:
        filename = file_record.original_filename
        owner_id = file_record.owner_id
        storage_filename = file_record.storage_filename
        file_record.delete()
        self.storage.delete(owner_id, storage_filename)
        AuditService.log_delete(user, filename)

    def get_stats(self, user) -> dict:
        files = FileRecord.objects.filter(owner=user)
        total_files = files.count()
        storage_used = files.aggregate(total=Sum("size"))["total"] or 0
        latest = files.first()
        return {
            "total_files": total_files,
            "storage_used": storage_used,
            "latest_upload": latest,
        }
