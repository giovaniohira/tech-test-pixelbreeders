from django.contrib import admin

from apps.groups.models import Group, GroupFile, GroupInvitation, GroupMembership


class GroupMembershipInline(admin.TabularInline):
    model = GroupMembership
    extra = 0


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name", "created_by", "created_at")
    inlines = [GroupMembershipInline]


@admin.register(GroupInvitation)
class GroupInvitationAdmin(admin.ModelAdmin):
    list_display = ("group", "invitee_username", "status", "created_at", "expires_at")


@admin.register(GroupFile)
class GroupFileAdmin(admin.ModelAdmin):
    list_display = ("group", "file", "added_by", "added_at")
