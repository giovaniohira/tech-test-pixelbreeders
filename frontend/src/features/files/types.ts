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

export interface FileStats {
  total_files: number;
  storage_used: number;
  latest_upload: FileRecord | null;
}

export type SortField = "name" | "size" | "uploaded_at";
export type SortDirection = "asc" | "desc";
export type FileTypeFilter = "all" | "image" | "pdf" | "text";
export type FileViewMode = "list" | "grid";

export interface UploadConfig {
  max_size_mb: number;
  max_size_bytes: number;
  allowed_extensions: string[];
  allowed_mime_types: string[];
}
