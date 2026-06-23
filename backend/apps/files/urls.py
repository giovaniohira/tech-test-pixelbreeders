from django.urls import path

from apps.files.views import (
    FileDetailView,
    FileDownloadView,
    FileListCreateView,
    FilePreviewView,
    FileStatsView,
)

urlpatterns = [
    path("", FileListCreateView.as_view(), name="files-list-create"),
    path("stats/", FileStatsView.as_view(), name="files-stats"),
    path("<uuid:id>/", FileDetailView.as_view(), name="files-detail"),
    path("<uuid:id>/download/", FileDownloadView.as_view(), name="files-download"),
    path("<uuid:id>/preview/", FilePreviewView.as_view(), name="files-preview"),
]
