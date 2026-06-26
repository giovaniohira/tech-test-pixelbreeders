from apps.files.models import FileRecord
from services.file_service import FileService


def file_serializer_context(request, files, service: FileService | None = None):
    file_service = service or FileService()
    if isinstance(files, FileRecord):
        file_list = [files]
    else:
        file_list = list(files)
    return {
        "request": request,
        "group_ids_map": file_service.build_group_ids_map(file_list),
    }
