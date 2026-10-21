"use client";

import type { Media } from "@/lib/api";

/** Error from the backend, including per-field validation messages. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Calls the backend through the website's /api proxy, sending the admin session cookie. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: "same-origin",
    headers: init.body ? { "Content-Type": "application/json", ...init.headers } : init.headers,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.fields);
  }
  return body as T;
}

/**
 * Uploads one photo or video and reports progress from 0 to 1.
 * XMLHttpRequest is used instead of fetch because fetch can't report upload progress.
 */
export function uploadFile(file: File, onProgress: (fraction: number) => void): Promise<Media> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/uploads");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let body: { url?: string; kind?: Media["kind"]; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body.url && body.kind) {
        resolve({ url: body.url, kind: body.kind });
      } else {
        reject(new ApiError(body.error ?? `Upload failed (${xhr.status})`, xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError("Upload failed. Check your connection.", 0));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
