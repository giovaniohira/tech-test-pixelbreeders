export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type { User, AuthTokens, AuthResponse } from "@/features/auth/types";
export type {
  FileRecord,
  Folder,
  FileStats,
  SortField,
  SortDirection,
  FileTypeFilter,
  FileViewMode,
  UploadConfig,
} from "@/features/files/types";
export type { Group, GroupMember, GroupInvitation, GroupDetail } from "@/features/groups/types";
