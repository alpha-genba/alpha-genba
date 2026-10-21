import type { ReactNode } from "react";

/**
 * A photo, or (until a real one is added) a neat technical placeholder of the same size.
 * To use a real photo: put the file in web/public/images/ and set its path in lib/content.ts (photos).
 */
export function Photo({
  src,
  alt,
  label,
  className = "",
  children,
}: {
  src?: string;
  alt: string;
  label?: string; // what photo belongs here, shown on the placeholder
  className?: string;
  children?: ReactNode; // optional overlay content
}) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="drawing-grid absolute inset-0 flex items-end p-5" role="img" aria-label={alt}>
          <Schematic />
          {label && (
            <span className="relative rounded-sm bg-white/90 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-sky-800 ring-1 ring-sky-200">
              Photo: {label}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/** A simple line drawing of a machine on a base frame, in blueprint style. */
function Schematic() {
  return (
    <svg viewBox="0 0 400 260" className="absolute inset-0 m-auto h-3/4 w-3/4 text-sky-600/40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="40" y="200" width="320" height="16" />
      <path d="M60 216 v28 M340 216 v28" />
      <rect x="70" y="80" width="150" height="120" />
      <rect x="90" y="100" width="110" height="60" />
      <circle cx="110" cy="180" r="7" />
      <circle cx="135" cy="180" r="7" />
      <path d="M240 200 V60 H330 V200" />
      <path d="M285 60 V110 M270 110 h30 v22 h-30 z" />
      <path d="M255 150 h60" strokeDasharray="6 6" />
      <path d="M70 60 h150 M145 60 v20" />
    </svg>
  );
}
