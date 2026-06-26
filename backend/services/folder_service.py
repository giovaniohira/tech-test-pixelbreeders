from django.contrib.auth.models import User
from django.db import transaction

from apps.files.models import FileRecord, Folder


class FolderService:
    def list_all_folders(self, user: User):
        return Folder.objects.filter(owner=user)

    def list_folders(self, user: User, parent_id=None):
        qs = Folder.objects.filter(owner=user)
        if parent_id:
            qs = qs.filter(parent_id=parent_id)
        else:
            qs = qs.filter(parent__isnull=True)
        return qs

    def get_user_folder(self, user: User, folder_id) -> Folder | None:
        return Folder.objects.filter(id=folder_id, owner=user).first()

    @transaction.atomic
    def create_folder(self, user: User, name: str, parent_id=None) -> Folder:
        parent = None
        if parent_id:
            parent = self.get_user_folder(user, parent_id)
            if not parent:
                raise ValueError("Parent folder not found.")

        if Folder.objects.filter(owner=user, parent=parent, name=name).exists():
            raise ValueError("A folder with this name already exists here.")

        return Folder.objects.create(owner=user, name=name, parent=parent)

    @transaction.atomic
    def delete_folder(self, user: User, folder: Folder) -> None:
        if folder.owner != user:
            raise PermissionError("You do not own this folder.")

        child_ids = self._collect_descendant_ids(folder)
        all_folder_ids = [folder.id, *child_ids]

        FileRecord.objects.filter(folder_id__in=all_folder_ids).update(folder=None)
        Folder.objects.filter(id__in=all_folder_ids).delete()

    def _collect_descendant_ids(self, folder: Folder) -> list:
        ids = []
        for child in Folder.objects.filter(parent=folder):
            ids.append(child.id)
            ids.extend(self._collect_descendant_ids(child))
        return ids

    @transaction.atomic
    def move_file_to_folder(
        self, user: User, file_record: FileRecord, folder_id=None
    ) -> FileRecord:
        if file_record.owner != user:
            raise PermissionError("You can only move your own files.")

        folder = None
        if folder_id:
            folder = self.get_user_folder(user, folder_id)
            if not folder:
                raise ValueError("Folder not found.")

        file_record.folder = folder
        file_record.save(update_fields=["folder"])
        return file_record
