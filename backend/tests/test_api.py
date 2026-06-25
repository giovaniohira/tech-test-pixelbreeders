import io
import os
import tempfile
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import User
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.files.models import FileRecord


class AuthAPITestCase(APITestCase):
    def setUp(self):
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.logout_url = reverse("auth-logout")
        self.refresh_url = reverse("auth-refresh")
        self.me_url = reverse("auth-me")
        self.user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }

    def _get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {"access": str(refresh.access_token), "refresh": str(refresh)}

    def test_register_success(self):
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["user"]["username"], "testuser")
        self.assertIn("access", response.data["data"]["tokens"])
        self.assertNotIn("refresh", response.data["data"]["tokens"])
        self.assertTrue(User.objects.filter(username="testuser").exists())

    def test_login_success(self):
        User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!",
        )
        response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data["data"]["tokens"])

    def test_invalid_login(self):
        User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!",
        )
        response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "WrongPassword!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_register_duplicate_user_generic_error(self):
        User.objects.create_user(
            username="existing",
            email="existing@example.com",
            password="SecurePass123!",
        )
        response = self.client.post(
            self.register_url,
            {
                "username": "existing",
                "email": "existing@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Unable to register with provided credentials.",
            str(response.data),
        )

    def test_protected_endpoint_requires_auth(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_with_valid_token(self):
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!",
        )
        tokens = self._get_tokens(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["username"], "testuser")

    def test_logout_with_refresh_cookie_only(self):
        User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!",
        )
        login_response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "SecurePass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        refresh_cookie = login_response.cookies.get(settings.REFRESH_COOKIE_NAME)
        self.assertIsNotNone(refresh_cookie)

        self.client.credentials()
        logout_response = self.client.post(self.logout_url)
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(self.refresh_url)
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_via_cookie(self):
        User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!",
        )
        login_response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "SecurePass123!"},
            format="json",
        )
        self.client.credentials()
        refresh_response = self.client.post(self.refresh_url)
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data["data"]["tokens"])

    def test_refresh_rejects_body_without_cookie(self):
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!",
        )
        tokens = self._get_tokens(user)
        response = self.client.post(
            self.refresh_url,
            {"refresh": tokens["refresh"]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FileAPITestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1", email="user1@example.com", password="SecurePass123!"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="user2@example.com", password="SecurePass123!"
        )
        self.tokens1 = self._get_tokens(self.user1)
        self.tokens2 = self._get_tokens(self.user2)
        self.files_url = reverse("files-list-create")
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {"access": str(refresh.access_token), "refresh": str(refresh)}

    def _auth_as(self, tokens):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    def _create_test_file(self, name="test.txt", content=b"Hello World", content_type="text/plain"):
        file = io.BytesIO(content)
        file.name = name
        file.content_type = content_type
        return file

    @patch("services.file_service.LocalFileStorage")
    def test_upload_success(self, mock_storage_cls):
        mock_storage = mock_storage_cls.return_value
        mock_storage.generate_storage_name.return_value = "abc123.txt"
        mock_storage.save.return_value = "/tmp/abc123.txt"

        self._auth_as(self.tokens1)
        test_file = self._create_test_file()
        response = self.client.post(self.files_url, {"file": test_file}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["original_filename"], "test.txt")
        self.assertEqual(FileRecord.objects.filter(owner=self.user1).count(), 1)

    @patch("services.file_service.LocalFileStorage")
    def test_invalid_file_type(self, mock_storage_cls):
        self._auth_as(self.tokens1)
        test_file = self._create_test_file(
            name="malware.exe", content=b"bad", content_type="application/octet-stream"
        )
        response = self.client.post(self.files_url, {"file": test_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("services.file_service.LocalFileStorage")
    def test_rejects_mime_spoofed_file(self, mock_storage_cls):
        self._auth_as(self.tokens1)
        test_file = self._create_test_file(
            name="fake.png",
            content=b"%PDF-1.4 fake pdf content",
            content_type="image/png",
        )
        response = self.client.post(self.files_url, {"file": test_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("services.file_service.LocalFileStorage")
    def test_file_size_validation(self, mock_storage_cls):
        self._auth_as(self.tokens1)
        large_content = b"x" * (11 * 1024 * 1024)
        test_file = self._create_test_file(content=large_content)
        response = self.client.post(self.files_url, {"file": test_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("services.file_service.LocalFileStorage")
    def test_delete_success(self, mock_storage_cls):
        mock_storage = mock_storage_cls.return_value
        mock_storage.generate_storage_name.return_value = "abc123.txt"
        mock_storage.save.return_value = "/tmp/abc123.txt"
        mock_storage.delete.return_value = True

        self._auth_as(self.tokens1)
        test_file = self._create_test_file()
        upload_response = self.client.post(
            self.files_url, {"file": test_file}, format="multipart"
        )
        file_id = upload_response.data["data"]["id"]

        delete_url = reverse("files-detail", kwargs={"id": file_id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(FileRecord.objects.filter(id=file_id).exists())

    def test_user_cannot_access_another_users_files(self):
        file_record = FileRecord.objects.create(
            owner=self.user1,
            original_filename="secret.txt",
            storage_filename="secret.txt",
            mime_type="text/plain",
            size=100,
        )

        self._auth_as(self.tokens2)
        list_response = self.client.get(self.files_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data["data"]), 0)

        detail_url = reverse("files-detail", kwargs={"id": file_record.id})
        detail_response = self.client.get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("services.file_service.LocalFileStorage")
    def test_user_cannot_delete_another_users_files(self, mock_storage_cls):
        file_record = FileRecord.objects.create(
            owner=self.user1,
            original_filename="secret.txt",
            storage_filename="secret.txt",
            mime_type="text/plain",
            size=100,
        )

        self._auth_as(self.tokens2)
        delete_url = reverse("files-detail", kwargs={"id": file_record.id})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(FileRecord.objects.filter(id=file_record.id).exists())

    @patch("apps.files.views.os.path.exists", return_value=True)
    @patch("builtins.open", create=True)
    @patch("services.file_service.LocalFileStorage")
    def test_user_cannot_download_another_users_files(
        self, mock_storage_cls, mock_open, mock_exists
    ):
        mock_storage = mock_storage_cls.return_value
        mock_storage.get_path.return_value = "/fake/path.txt"

        file_record = FileRecord.objects.create(
            owner=self.user1,
            original_filename="secret.txt",
            storage_filename="secret.txt",
            mime_type="text/plain",
            size=100,
        )

        self._auth_as(self.tokens2)
        download_url = reverse("files-download", kwargs={"id": file_record.id})
        response = self.client.get(download_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @override_settings(MAX_STORAGE_QUOTA_BYTES=100)
    @patch("services.file_service.LocalFileStorage")
    def test_storage_quota_exceeded(self, mock_storage_cls):
        mock_storage = mock_storage_cls.return_value
        mock_storage.generate_storage_name.return_value = "abc123.txt"
        mock_storage.save.return_value = "/tmp/abc123.txt"

        FileRecord.objects.create(
            owner=self.user1,
            original_filename="existing.txt",
            storage_filename="existing.txt",
            mime_type="text/plain",
            size=80,
        )

        self._auth_as(self.tokens1)
        test_file = self._create_test_file(content=b"x" * 30)
        response = self.client.post(self.files_url, {"file": test_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
