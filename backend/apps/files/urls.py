from django.urls import path

from apps.files.views import (
    FileDetailView,
    FileDownloadView,
    FileListCreateView,
    FileMoveView,
    FilePreviewView,
    FileStatsView,
)
from apps.files.folder_views import FolderDetailView, FolderListCreateView

urlpatterns = [
    path("", FileListCreateView.as_view(), name="files-list-create"),
    path("stats/", FileStatsView.as_view(), name="files-stats"),
    path("folders/", FolderListCreateView.as_view(), name="folders-list-create"),
    path("folders/<uuid:id>/", FolderDetailView.as_view(), name="folders-detail"),
    path("<uuid:id>/", FileDetailView.as_view(), name="files-detail"),
    path("<uuid:id>/move/", FileMoveView.as_view(), name="files-move"),
    path("<uuid:id>/download/", FileDownloadView.as_view(), name="files-download"),
    path("<uuid:id>/preview/", FilePreviewView.as_view(), name="files-preview"),
]
