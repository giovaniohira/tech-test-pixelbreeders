from django.contrib import admin

from apps.files.models import AuditLog, FileRecord


@admin.register(FileRecord)
class FileRecordAdmin(admin.ModelAdmin):
    list_display = ("original_filename", "owner", "mime_type", "size", "uploaded_at")
    list_filter = ("mime_type", "uploaded_at")
    search_fields = ("original_filename", "owner__username")
    readonly_fields = ("id", "uploaded_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "filename", "user", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("filename", "user__username")
    readonly_fields = ("id", "created_at")
