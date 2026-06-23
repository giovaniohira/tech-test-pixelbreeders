import uuid

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class FileRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    original_filename = models.CharField(max_length=255)
    storage_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size = models.PositiveBigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        indexes = [
            models.Index(fields=["owner", "-uploaded_at"]),
            models.Index(fields=["owner", "original_filename"]),
        ]

    def __str__(self):
        return f"{self.original_filename} ({self.owner.username})"


class AuditAction(models.TextChoices):
    UPLOAD = "upload", "Upload"
    DOWNLOAD = "download", "Download"
    DELETE = "delete", "Delete"


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="audit_logs")
    file = models.ForeignKey(
        FileRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=20, choices=AuditAction.choices)
    filename = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["action"]),
        ]

    def __str__(self):
        return f"{self.action} - {self.filename}"
