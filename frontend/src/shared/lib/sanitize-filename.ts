export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "download";
  const cleaned = base.replace(/[\r\n"\\]/g, "").replace(/[^\w.\- ]/g, "_").trim();
  return cleaned.slice(0, 255) || "download";
}
