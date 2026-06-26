from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.db.models import Sum

from apps.files.models import FileRecord, Folder
from apps.files.validators import validate_upload_file
from core.exceptions import StorageQuotaExceeded
from services.audit_service import AuditService
from services.group_service import GroupService
from storage.local import LocalFileStorage


class FileService:
    def __init__(self, storage: LocalFileStorage | None = None):
        self.storage = storage or LocalFileStorage()
        self.group_service = GroupService()

    @transaction.atomic
    def upload(self, user, uploaded_file, folder_id=None) -> FileRecord:
        mime_type = validate_upload_file(uploaded_file)
        uploaded_file.seek(0)

        stats = self.get_stats(user)
        if stats["storage_used"] + uploaded_file.size > settings.MAX_STORAGE_QUOTA_BYTES:
            raise StorageQuotaExceeded()

        folder = None
        if folder_id:
            folder = Folder.objects.filter(id=folder_id, owner=user).first()
            if not folder:
                raise ValueError("Folder not found.")

        storage_name = self.storage.generate_storage_name(uploaded_file.name)
        try:
            self.storage.save(user.id, storage_name, uploaded_file)

            record = FileRecord.objects.create(
                owner=user,
                folder=folder,
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

    def can_access(self, user, file_record: FileRecord) -> bool:
        return self.group_service.user_can_access_file(user, file_record)

    def can_modify(self, user, file_record: FileRecord) -> bool:
        return file_record.owner == user

    def get_accessible_file(self, user, file_id) -> FileRecord | None:
        record = FileRecord.objects.filter(id=file_id).first()
        if not record or not self.can_access(user, record):
            return None
        return record

    def get_owned_file(self, user, file_id) -> FileRecord | None:
        return FileRecord.objects.filter(id=file_id, owner=user).first()

    def get_user_file(self, user, file_id) -> FileRecord | None:
        return self.get_accessible_file(user, file_id)

    def list_user_files(self, user, folder_id=None):
        qs = FileRecord.objects.filter(owner=user)
        if folder_id:
            qs = qs.filter(folder_id=folder_id)
        else:
            qs = qs.filter(folder__isnull=True)
        return qs

    def get_storage_path(self, file_record: FileRecord):
        return self.storage.get_path(file_record.owner_id, file_record.storage_filename)

    @transaction.atomic
    def delete(self, user, file_record: FileRecord) -> None:
        if not self.can_modify(user, file_record):
            raise PermissionError("You do not have permission to delete this file.")
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
