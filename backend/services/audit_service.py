from apps.files.models import AuditAction, AuditLog, FileRecord


class AuditService:
    @staticmethod
    def log(user, action: str, filename: str, file_record: FileRecord | None = None):
        AuditLog.objects.create(
            user=user,
            file=file_record,
            action=action,
            filename=filename,
        )

    @staticmethod
    def log_upload(user, file_record: FileRecord):
        AuditService.log(user, AuditAction.UPLOAD, file_record.original_filename, file_record)

    @staticmethod
    def log_download(user, file_record: FileRecord):
        AuditService.log(user, AuditAction.DOWNLOAD, file_record.original_filename, file_record)

    @staticmethod
    def log_delete(user, filename: str, file_record: FileRecord | None = None):
        AuditService.log(user, AuditAction.DELETE, filename, file_record)
