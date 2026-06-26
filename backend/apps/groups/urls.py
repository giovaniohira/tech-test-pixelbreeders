from django.urls import path

from apps.groups.views import (
    GroupDetailView,
    GroupFileListCreateView,
    GroupFileRemoveView,
    GroupInvitationAcceptView,
    GroupInvitationListView,
    GroupInviteView,
    GroupLeaveView,
    GroupListCreateView,
    GroupMemberRemoveView,
)

urlpatterns = [
    path("", GroupListCreateView.as_view(), name="groups-list-create"),
    path("invitations/", GroupInvitationListView.as_view(), name="group-invitations"),
    path("invitations/<uuid:token>/accept/", GroupInvitationAcceptView.as_view(), name="group-invitation-accept"),
    path("<uuid:id>/", GroupDetailView.as_view(), name="groups-detail"),
    path("<uuid:id>/invite/", GroupInviteView.as_view(), name="groups-invite"),
    path("<uuid:id>/leave/", GroupLeaveView.as_view(), name="groups-leave"),
    path("<uuid:id>/members/<uuid:member_id>/", GroupMemberRemoveView.as_view(), name="groups-member-remove"),
    path("<uuid:id>/files/", GroupFileListCreateView.as_view(), name="group-files"),
    path("<uuid:id>/files/<uuid:file_id>/", GroupFileRemoveView.as_view(), name="group-file-remove"),
]
