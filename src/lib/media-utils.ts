export type FileKind = "image" | "video" | "audio" | "pdf" | "doc" | "sheet" | "archive" | "font" | "code" | "other";

export function getExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function getFileKind(mime: string | null | undefined, name: string): FileKind {
  const m = (mime ?? "").toLowerCase();
  const ext = getExtension(name);
  if (m.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico", "tiff"].includes(ext)) return "image";
  if (m.startsWith("video/") || ["mp4", "webm", "mov", "mkv", "avi"].includes(ext)) return "video";
  if (m.startsWith("audio/") || ["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext)) return "audio";
  if (m === "application/pdf" || ext === "pdf") return "pdf";
  if (["doc", "docx", "odt", "rtf", "txt", "md"].includes(ext) || m.includes("word")) return "doc";
  if (["xls", "xlsx", "csv", "ods"].includes(ext) || m.includes("sheet") || m.includes("excel")) return "sheet";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["woff", "woff2", "ttf", "otf", "eot"].includes(ext) || m.startsWith("font/")) return "font";
  if (["json", "xml", "yaml", "yml", "js", "ts", "tsx", "jsx", "html", "css"].includes(ext)) return "code";
  return "other";
}

export function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) { n /= 1024; u++; }
  return `${n.toFixed(n >= 10 || u === 0 ? 0 : 1)} ${units[u]}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso; }
}

export function basename(path: string): string {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(i + 1) : path;
}

export function dirname(path: string): string {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(0, i) : "";
}
