import { FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { downloadFileRecord } from "@/features/files/api/files-api";
import { getErrorMessage } from "@/shared/api/client";
import type { FileRecord } from "@/shared/types";

export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  return FileText;
}

export async function downloadFileWithToast(file: FileRecord) {
  try {
    await downloadFileRecord(file);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
}
