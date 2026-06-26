import os

from django.http import FileResponse, Http404
from rest_framework import generics, parsers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.files.models import FileRecord
from apps.files.serializers import (
    FileMoveSerializer,
    FileRecordSerializer,
    FileStatsSerializer,
    FileUploadSerializer,
)
from core.permissions import IsOwner
from core.responses import error_response, success_response
from core.utils import sanitize_filename
from core.exceptions import StorageQuotaExceeded
from services.audit_service import AuditService
from services.file_service import FileService
from services.folder_service import FolderService


class FileListCreateView(generics.ListCreateAPIView):
    serializer_class = FileRecordSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "upload"

    def get_throttles(self):
        if self.request.method == "POST":
            return super().get_throttles()
        return []
    def get_queryset(self):
        folder_id = self.request.query_params.get("folder_id")
        service = FileService()
        return service.list_user_files(self.request.user, folder_id=folder_id or None)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True, context={"request": request})
        return success_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        upload_serializer = FileUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)

        service = FileService()
        try:
            record = service.upload(
                request.user,
                upload_serializer.validated_data["file"],
                folder_id=upload_serializer.validated_data.get("folder_id"),
            )
        except StorageQuotaExceeded:
            return error_response(
                "Storage quota exceeded.",
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)
        return success_response(
            data=FileRecordSerializer(record, context={"request": request}).data,
            message="File uploaded successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class FileDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = FileRecordSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    lookup_field = "id"

    def get_queryset(self):
        return FileRecord.objects.filter(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={"request": request})
        return success_response(data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        service = FileService()
        service.delete(request.user, instance)
        return success_response(message="File deleted successfully.", status_code=status.HTTP_200_OK)


class FileMoveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        move_serializer = FileMoveSerializer(data=request.data)
        move_serializer.is_valid(raise_exception=True)

        service = FileService()
        file_record = service.get_user_file(request.user, id)
        if not file_record or file_record.owner != request.user:
            raise Http404("File not found.")

        folder_service = FolderService()
        try:
            updated = folder_service.move_file_to_folder(
                request.user,
                file_record,
                folder_id=move_serializer.validated_data.get("folder_id"),
            )
        except (PermissionError, ValueError) as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        return success_response(
            data=FileRecordSerializer(updated, context={"request": request}).data,
            message="File moved successfully.",
        )


class FileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        service = FileService()
        file_record = service.get_user_file(request.user, id)

        if not file_record:
            raise Http404("File not found.")

        file_path = service.get_storage_path(file_record)

        if not os.path.exists(file_path):
            raise Http404("File not found on storage.")

        AuditService.log_download(request.user, file_record)

        content_type = file_record.mime_type or "application/octet-stream"
        response = FileResponse(
            open(file_path, "rb"),
            content_type=content_type,
            as_attachment=True,
            filename=sanitize_filename(file_record.original_filename),
        )
        response["Content-Length"] = file_record.size
        return response


class FileStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = FileService()
        stats = service.get_stats(request.user)
        serializer = FileStatsSerializer(
            {
                "total_files": stats["total_files"],
                "storage_used": stats["storage_used"],
                "latest_upload": stats["latest_upload"],
            }
        )
        return success_response(data=serializer.data)


class FilePreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        service = FileService()
        file_record = service.get_user_file(request.user, id)

        if not file_record or not file_record.mime_type.startswith("image/"):
            raise Http404("Preview not available.")

        file_path = service.get_storage_path(file_record)

        if not os.path.exists(file_path):
            raise Http404("File not found on storage.")

        content_type = file_record.mime_type
        response = FileResponse(
            open(file_path, "rb"),
            content_type=content_type,
            as_attachment=False,
        )
        response["Content-Length"] = file_record.size
        return response
