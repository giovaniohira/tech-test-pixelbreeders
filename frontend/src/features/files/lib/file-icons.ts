import { FileText, Image as ImageIcon } from "lucide-react";

export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  return FileText;
}
