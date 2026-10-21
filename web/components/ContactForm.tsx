"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";

type FieldErrors = Partial<Record<"name" | "company" | "email" | "phone" | "industry" | "message", string>>;

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    setStatus("sending");
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        setStatus("sent");
        return;
      }
      setErrors(body.fields ?? {});
      setFormError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setFormError("We couldn't send your message. Please check your connection, or call us directly.");
    }
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-12 text-center">
        <CircleCheck size={48} className="text-emerald-400" />
        <h2 className="mt-5 text-2xl font-semibold">Thank you, we&apos;ve received your enquiry</h2>
        <p className="mt-3 max-w-sm text-slate-400">Our team will get back to you soon.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-sm text-orange-400 hover:underline">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name} required autoComplete="name" />
        <Field label="Company" name="company" error={errors.company} autoComplete="organization" />
        <Field label="Email" name="email" type="email" error={errors.email} autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" error={errors.phone} autoComplete="tel" />
      </div>
      <div className="mt-5">
        <Field label="Industry" name="industry" error={errors.industry} placeholder="e.g. Automotive components, Electrical, Packaging" />
      </div>
      <div className="mt-5">
        <label htmlFor="message" className="text-sm font-medium text-slate-300">
          What would you like to automate? <span className="text-orange-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={inputClass}
          placeholder="Describe your process, the problem you're facing, and your production volume."
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="mt-1.5 text-sm text-red-400">{errors.message}</p>}
      </div>

      {/* Honeypot: hidden from people, so only spam bots fill it in */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="mt-5 text-xs text-slate-500">Please give at least an email or a phone number so we can reply.</p>
      {formError && <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{formError}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-orange-400 disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
        {status === "sending" ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-300">
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
      <input id={name} name={name} type={type} className={inputClass} aria-invalid={!!error} {...rest} />
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}
