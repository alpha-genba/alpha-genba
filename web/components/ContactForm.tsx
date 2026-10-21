"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";

type FieldErrors = Partial<Record<"name" | "company" | "email" | "phone" | "industry" | "message", string>>;

export const inputClass =
  "mt-2 w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3.5 text-lg text-slate-900 placeholder:text-slate-400 transition focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100 aria-[invalid=true]:border-red-300";

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
      <div className="flex flex-col items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 p-12 text-center animate-[fade-in_400ms_ease-out]">
        <CircleCheck size={64} className="text-emerald-500" />
        <h2 className="mt-6 text-3xl font-bold text-slate-900">Thank you, we&apos;ve received your details</h2>
        <p className="mt-3 max-w-md text-lg text-slate-600">Our team will call you back soon.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-8 font-semibold text-sky-700 hover:underline">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-md border border-slate-200 bg-white p-6 sm:p-10">
      <h2 className="text-2xl font-bold text-slate-900">Send us your requirement</h2>
      <p className="mt-1 text-slate-500">Fields marked <span className="text-sky-700">*</span> are required.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name} required autoComplete="name" />
        <Field label="Phone number" name="phone" type="tel" error={errors.phone} required autoComplete="tel" placeholder="+91" />
        <Field label="Company" name="company" error={errors.company} autoComplete="organization" />
        <Field label="Email" name="email" type="email" error={errors.email} autoComplete="email" />
      </div>
      <div className="mt-6">
        <Field label="Industry" name="industry" error={errors.industry} placeholder="e.g. Automotive components, Electrical, Packaging" />
      </div>
      <div className="mt-6">
        <label htmlFor="message" className="font-medium text-slate-700">
          What would you like to automate? <span className="text-sky-700">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={inputClass}
          placeholder="Describe your process, the problem you're facing, and your production volume."
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="mt-2 text-red-600">{errors.message}</p>}
      </div>

      {/* Honeypot: hidden from people, so only spam bots fill it in */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {formError && <p className="mt-6 rounded-md bg-red-50 px-5 py-4 text-red-700">{formError}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-md bg-sky-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? <LoaderCircle size={22} className="animate-spin" /> : <Send size={22} />}
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
      <label htmlFor={name} className="font-medium text-slate-700">
        {label} {required && <span className="text-sky-700">*</span>}
      </label>
      <input id={name} name={name} type={type} className={inputClass} aria-invalid={!!error} {...rest} />
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
