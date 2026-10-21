"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { Media } from "@/lib/api";

/**
 * A grid of photos and videos. Clicking one opens it full-screen;
 * arrow keys or the buttons move between items, Escape closes.
 */
export function MediaGallery({ items, alt }: { items: Media[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((dir: number) => setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // stop the page scrolling behind the viewer
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (items.length === 0) return null;
  const current = open === null ? null : items[open];

  return (
    <>
      <div className={`grid gap-3 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}>
        {items.map((m, i) => (
          <button
            key={m.url + i}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-md bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            aria-label={`Open ${m.kind === "video" ? "video" : "photo"} ${i + 1} of ${items.length}`}
          >
            {m.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={`${alt}, photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <>
                <video src={`${m.url}#t=0.5`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-slate-900/25 transition group-hover:bg-slate-900/35">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-sky-700 shadow-lg transition-transform group-hover:scale-110">
                    <Play size={30} className="ml-1" fill="currentColor" />
                  </span>
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={close}
        >
          <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Close">
            <X size={28} />
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {current.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={current.url} src={current.url} alt={alt} className="max-h-[85vh] w-auto rounded-md object-contain" />
            ) : (
              <video key={current.url} src={current.url} controls autoPlay playsInline className="max-h-[85vh] w-auto rounded-md" />
            )}
          </div>
          {items.length > 1 && (
            <p className="absolute bottom-5 text-white/80">
              {(open ?? 0) + 1} / {items.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
