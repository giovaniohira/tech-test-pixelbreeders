import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/shared/constants";

const ALLOWED_EXTENSIONS = new Set(
  Object.values(ALLOWED_FILE_TYPES).flatMap((extensions) => extensions),
);

function isAllowedFileType(file: File): boolean {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  return ALLOWED_EXTENSIONS.has(extension);
}

export function validateFileForUpload(file: File): string | null {
  if (!isAllowedFileType(file)) {
    return "Tipo de arquivo não permitido. Tipos aceitos: PNG, JPG, PDF, TXT.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `O arquivo excede o limite de ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}
