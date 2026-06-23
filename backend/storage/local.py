import os
import uuid
from pathlib import Path

from django.conf import settings


class LocalFileStorage:
    """Filesystem storage adapter for user uploads."""

    def __init__(self, base_path: str | None = None):
        self.base_path = Path(base_path or settings.FILE_STORAGE_PATH)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _user_dir(self, user_id: int) -> Path:
        path = self.base_path / str(user_id)
        path.mkdir(parents=True, exist_ok=True)
        return path

    def generate_storage_name(self, original_filename: str) -> str:
        extension = Path(original_filename).suffix.lower()
        return f"{uuid.uuid4().hex}{extension}"

    def save(self, user_id: int, storage_name: str, file_obj) -> str:
        destination = self._user_dir(user_id) / storage_name
        with open(destination, "wb") as dest:
            for chunk in file_obj.chunks():
                dest.write(chunk)
        return str(destination)

    def get_path(self, user_id: int, storage_name: str) -> Path:
        return self._user_dir(user_id) / storage_name

    def delete(self, user_id: int, storage_name: str) -> bool:
        path = self.get_path(user_id, storage_name)
        if path.exists():
            os.remove(path)
            return True
        return False

    def exists(self, user_id: int, storage_name: str) -> bool:
        return self.get_path(user_id, storage_name).exists()
