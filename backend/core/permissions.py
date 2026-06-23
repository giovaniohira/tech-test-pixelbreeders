from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Object-level permission ensuring users only access their own resources."""

    def has_object_permission(self, request, view, obj):
        return getattr(obj, "owner", None) == request.user
