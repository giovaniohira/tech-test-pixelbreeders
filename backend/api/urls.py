from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.authentication.urls")),
    path("files/", include("apps.files.urls")),
]
