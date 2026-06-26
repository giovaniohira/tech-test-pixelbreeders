from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.files.folder_serializers import FolderCreateSerializer, FolderSerializer
from apps.files.models import Folder
from core.permissions import IsOwner
from core.responses import error_response, success_response
from services.folder_service import FolderService


class FolderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        service = FolderService()
        if self.request.query_params.get("all") == "true":
            return service.list_all_folders(self.request.user)
        parent_id = self.request.query_params.get("parent_id")
        return service.list_folders(self.request.user, parent_id=parent_id or None)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = FolderSerializer(queryset, many=True)
        return success_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = FolderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = FolderService()
        try:
            folder = service.create_folder(
                request.user,
                serializer.validated_data["name"],
                parent_id=serializer.validated_data.get("parent_id"),
            )
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        return success_response(
            data=FolderSerializer(folder).data,
            message="Folder created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class FolderDetailView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsOwner]
    lookup_field = "id"

    def get_queryset(self):
        return Folder.objects.filter(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        service = FolderService()
        try:
            service.delete_folder(request.user, instance)
        except PermissionError as exc:
            return error_response(str(exc), status.HTTP_403_FORBIDDEN)

        return success_response(message="Folder deleted successfully.")
