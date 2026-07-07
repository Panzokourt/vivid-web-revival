import { useState } from "react";
import { FileText, FileVideo, FileAudio, FileArchive, Type, Code as CodeIcon, File as FileIcon, Sheet, Play } from "lucide-react";
import { getFileKind, getExtension, type FileKind } from "@/lib/media-utils";

const KIND_META: Record<FileKind, { Icon: typeof FileIcon; bg: string; fg: string }> = {
  image:   { Icon: FileIcon,    bg: "bg-ink/5",              fg: "text-ink/40" },
  video:   { Icon: FileVideo,   bg: "bg-indigo-50",          fg: "text-indigo-600" },
  audio:   { Icon: FileAudio,   bg: "bg-purple-50",          fg: "text-purple-600" },
  pdf:     { Icon: FileText,    bg: "bg-red-50",             fg: "text-red-600" },
  doc:     { Icon: FileText,    bg: "bg-blue-50",            fg: "text-blue-600" },
  sheet:   { Icon: Sheet,       bg: "bg-emerald-50",         fg: "text-emerald-600" },
  archive: { Icon: FileArchive, bg: "bg-amber-50",           fg: "text-amber-700" },
  font:    { Icon: Type,        bg: "bg-slate-100",          fg: "text-slate-700" },
  code:    { Icon: CodeIcon,    bg: "bg-teal-50",            fg: "text-teal-700" },
  other:   { Icon: FileIcon,    bg: "bg-ink/5",              fg: "text-ink/50" },
};

type Props = {
  name: string;
  url: string;
  mime: string | null;
  className?: string;
};

export function FilePreview({ name, url, mime, className = "aspect-square" }: Props) {
  const kind = getFileKind(mime, name);
  const ext = getExtension(name);
  const [errored, setErrored] = useState(false);

  if (kind === "image" && url && !errored) {
    return (
      <div className={`${className} bg-ink/5 overflow-hidden`}>
        <img
          src={url}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      </div>
    );
  }

  if (kind === "video" && url && !errored) {
    return (
      <div className={`${className} bg-black overflow-hidden relative group`}>
        <video
          src={url}
          className="w-full h-full object-cover"
          preload="metadata"
          onError={() => setErrored(true)}
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-white/90 p-3 shadow-lg">
            <Play className="h-5 w-5 text-black fill-black" />
          </div>
        </div>
      </div>
    );
  }

  const { Icon, bg, fg } = KIND_META[kind];
  return (
    <div className={`${className} ${bg} flex flex-col items-center justify-center gap-2`}>
      <Icon className={`h-10 w-10 ${fg}`} strokeWidth={1.5} />
      {ext && (
        <span className={`text-[10px] font-mono uppercase tracking-wider ${fg} px-2 py-0.5 rounded bg-white/60`}>
          {ext}
        </span>
      )}
    </div>
  );
}
