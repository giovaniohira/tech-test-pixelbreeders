import mimetypes
from pathlib import Path

from django.db import transaction

from apps.files.models import FileRecord
from apps.files.validators import validate_upload_file
from services.audit_service import AuditService
from storage.local import LocalFileStorage


class FileService:
    def __init__(self, storage: LocalFileStorage | None = None):
        self.storage = storage or LocalFileStorage()

    @transaction.atomic
    def upload(self, user, uploaded_file) -> FileRecord:
        validate_upload_file(uploaded_file)

        storage_name = self.storage.generate_storage_name(uploaded_file.name)
        self.storage.save(user.id, storage_name, uploaded_file)

        mime_type = uploaded_file.content_type or mimetypes.guess_type(uploaded_file.name)[0] or "application/octet-stream"

        record = FileRecord.objects.create(
            owner=user,
            original_filename=Path(uploaded_file.name).name,
            storage_filename=storage_name,
            mime_type=mime_type,
            size=uploaded_file.size,
        )

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
        self.storage.delete(file_record.owner_id, file_record.storage_filename)
        file_record.delete()
        AuditService.log_delete(user, filename)

    def get_stats(self, user) -> dict:
        files = FileRecord.objects.filter(owner=user)
        total_files = files.count()
        storage_used = sum(f.size for f in files.only("size"))
        latest = files.first()
        return {
            "total_files": total_files,
            "storage_used": storage_used,
            "latest_upload": latest,
        }
