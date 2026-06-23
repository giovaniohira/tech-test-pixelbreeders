export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: number;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
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
}

export interface FileStats {
  total_files: number;
  storage_used: number;
  latest_upload: FileRecord | null;
}

export type SortField = "name" | "size" | "uploaded_at";
export type SortDirection = "asc" | "desc";
