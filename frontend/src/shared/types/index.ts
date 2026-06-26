export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthTokens {
  access: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface FileRecord {
  id: string;
  original_filename: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
  is_image: boolean;
  folder_id: string | null;
  group_ids: string[];
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  file_count: number;
}

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

export interface FileStats {
  total_files: number;
  storage_used: number;
  latest_upload: FileRecord | null;
}

export type SortField = "name" | "size" | "uploaded_at";
export type SortDirection = "asc" | "desc";
export type FileTypeFilter = "all" | "image" | "pdf" | "text";
export type FileViewMode = "list" | "grid";
