"use client";

import { useRef, useState, type Dispatch, type DragEvent, type SetStateAction } from "react";
import { ImagePlus, LoaderCircle, Video, X } from "lucide-react";
import type { Media } from "@/lib/api";
import { uploadFile } from "./api";

type Pending = { id: number; name: string; progress: number; error?: string };

/**
 * Pick or drag-and-drop photos (and optionally videos). Files upload right away with a
 * progress bar, and the finished items appear as thumbnails that can be removed.
 */
export function MediaUpload({
  value,
  setValue,
  allowVideo = true,
  multiple = true,
  label,
}: {
  value: Media[];
  setValue: Dispatch<SetStateAction<Media[]>>;
  allowVideo?: boolean;
  multiple?: boolean;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);

  function start(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, multiple ? 20 : 1);
    for (const file of list) {
      const id = nextId.current++;
      setPending((p) => [...p, { id, name: file.name, progress: 0 }]);
      uploadFile(file, (fraction) => setPending((p) => p.map((x) => (x.id === id ? { ...x, progress: fraction } : x))))
        .then((media) => {
          // Update from the previous value, so uploads finishing at the same moment are all kept.
          setValue((prev) => (multiple ? [...prev, media] : [media]));
          setPending((p) => p.filter((x) => x.id !== id));
        })
        .catch((err: Error) => setPending((p) => p.map((x) => (x.id === id ? { ...x, error: err.message } : x))));
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    start(e.dataTransfer.files);
  }

  const accept = allowVideo ? "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/gif";

  return (
    <div>
      <span className="font-medium text-slate-700">{label}</span>

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {value.map((m, i) => (
            <li key={m.url + i} className="group relative aspect-square overflow-hidden rounded-md bg-sky-50 ring-1 ring-sky-100">
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="relative h-full w-full">
                  <video src={`${m.url}#t=0.5`} preload="metadata" muted className="h-full w-full object-cover" />
                  <Video size={20} className="absolute bottom-2 left-2 text-white drop-shadow" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setValue((prev) => prev.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1.5 text-slate-700 shadow transition hover:bg-red-50 hover:text-red-600"
                aria-label="Remove"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <ul className="mt-3 space-y-2">
          {pending.map((p) => (
            <li key={p.id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-700">{p.name}</span>
                {p.error ? (
                  <button type="button" onClick={() => setPending((x) => x.filter((y) => y.id !== p.id))} className="shrink-0 text-slate-500 hover:text-slate-900">
                    Dismiss
                  </button>
                ) : (
                  <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-sky-700">
                    <LoaderCircle size={16} className="animate-spin" /> {Math.round(p.progress * 100)}%
                  </span>
                )}
              </div>
              {p.error ? (
                <p className="mt-1 text-sm text-red-600">{p.error}</p>
              ) : (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-100">
                  <div className="h-full rounded-full bg-sky-600 transition-all duration-200" style={{ width: `${p.progress * 100}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {(multiple || value.length === 0) && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 text-center transition ${
            dragging ? "border-sky-400 bg-sky-50" : "border-sky-200 hover:border-sky-300 hover:bg-sky-50/50"
          }`}
        >
          <ImagePlus size={30} className="text-sky-500" />
          <span className="font-medium text-slate-700">
            {multiple ? "Click or drop files here" : "Click or drop a photo here"}
          </span>
          <span className="text-sm text-slate-500">
            {allowVideo ? "Photos (JPG, PNG, WebP) up to 10 MB · Videos (MP4, WebM) up to 300 MB" : "JPG, PNG or WebP, up to 10 MB"}
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          start(e.target.files);
          e.target.value = ""; // allow picking the same file again
        }}
      />
    </div>
  );
}
