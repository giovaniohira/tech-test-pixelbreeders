import type { FileRecord } from "@/features/files/types";

export interface Group {
  id: string;
  name: string;
  created_at: string;
  member_count: number;
  file_count: number;
  my_role: "owner" | "member" | null;
}

export interface GroupMember {
  id: string;
  username: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  group_name: string;
  invitee_username: string;
  invited_by_username: string;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export interface GroupDetail {
  group: Group;
  members: GroupMember[];
  files: FileRecord[];
  pending_invitations?: GroupInvitation[];
  my_shared_file_count?: number;
}
