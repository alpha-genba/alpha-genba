"use client";

import type { ReactNode } from "react";

export const inputClass =
  "mt-2 w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-red-600">{error}</span> : hint && <span className="mt-1.5 block text-sm text-slate-500">{hint}</span>}
    </label>
  );
}

export function PrimaryButton({ children, disabled, onClick, type = "submit" }: { children: ReactNode; disabled?: boolean; onClick?: () => void; type?: "submit" | "button" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-sky-300"
    >
      {children}
    </button>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-red-50 px-5 py-4 text-red-700">{children}</p>;
}
