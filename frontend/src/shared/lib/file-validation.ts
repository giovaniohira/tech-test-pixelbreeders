import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/shared/constants";
import type { UploadConfig } from "@/features/files/types";

const ALLOWED_EXTENSIONS = new Set(
  Object.values(ALLOWED_FILE_TYPES).flatMap((extensions) => extensions),
);

function isAllowedFileType(file: File, config?: UploadConfig): boolean {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (config) {
    return config.allowed_extensions.includes(extension);
  }
  return ALLOWED_EXTENSIONS.has(extension);
}

export function validateFileForUpload(file: File, config?: UploadConfig): string | null {
  if (!isAllowedFileType(file, config)) {
    return "Tipo de arquivo não permitido. Tipos aceitos: PNG, JPG, PDF, TXT.";
  }

  const maxBytes = config?.max_size_bytes ?? MAX_FILE_SIZE_BYTES;
  const maxMb = config?.max_size_mb ?? MAX_FILE_SIZE_MB;

  if (file.size > maxBytes) {
    return `O arquivo excede o limite de ${maxMb} MB.`;
  }
  return null;
}
