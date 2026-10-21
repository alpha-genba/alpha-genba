"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FolderKanban, Inbox, LoaderCircle, LogOut } from "lucide-react";
import { api, ApiError } from "./api";
import { EnquiriesTab } from "./EnquiriesTab";
import { ProjectsTab } from "./ProjectsTab";

export function AdminApp() {
  const [state, setState] = useState<"checking" | "login" | "ready">("checking");
  const [tab, setTab] = useState<"enquiries" | "projects">("enquiries");

  useEffect(() => {
    api<{ admin: boolean }>("/admin/me")
      .then((r) => setState(r.admin ? "ready" : "login"))
      .catch(() => setState("login"));
  }, []);

  async function logout() {
    await api("/admin/logout", { method: "POST" }).catch(() => {});
    setState("login");
  }

  if (state === "checking") {
    return (
      <div className="grid min-h-[60vh] place-items-center text-slate-500">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }
  if (state === "login") return <Login onSuccess={() => setState("ready")} />;

  // Any request that comes back 401 means the session expired.
  const onUnauthorized = () => setState("login");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Admin panel</h1>
        <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900">
          <LogOut size={16} /> Log out
        </button>
      </div>

      <div className="mt-8 flex gap-2 border-b border-slate-800">
        <TabButton active={tab === "enquiries"} onClick={() => setTab("enquiries")} icon={<Inbox size={16} />} label="Enquiries" />
        <TabButton active={tab === "projects"} onClick={() => setTab("projects")} icon={<FolderKanban size={16} />} label="Projects" />
      </div>

      <div className="mt-8">
        {tab === "enquiries" ? <EnquiriesTab onUnauthorized={onUnauthorized} /> : <ProjectsTab onUnauthorized={onUnauthorized} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
        active ? "border-orange-500 text-white" : "border-transparent text-slate-400 hover:text-white"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password");
    setBusy(true);
    setError("");
    try {
      await api("/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <h1 className="text-xl font-bold">Admin login</h1>
        <p className="mt-1 text-sm text-slate-400">For the Alpha Automations team.</p>
        <label htmlFor="password" className="mt-6 block text-sm font-medium text-slate-300">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 focus:border-orange-500 focus:outline-none"
        />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60">
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
