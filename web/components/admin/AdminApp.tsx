"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Construction, FolderCheck, Inbox, LoaderCircle, LockKeyhole, LogOut } from "lucide-react";
import { api, ApiError } from "./api";
import { EnquiriesTab } from "./EnquiriesTab";
import { ProjectsTab } from "./ProjectsTab";
import { OngoingTab } from "./OngoingTab";
import { inputClass, PrimaryButton } from "./ui";

type Tab = "enquiries" | "ongoing" | "projects";

export function AdminApp() {
  const [state, setState] = useState<"checking" | "login" | "ready">("checking");
  const [tab, setTab] = useState<Tab>("enquiries");

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
      <div className="grid min-h-[60vh] place-items-center text-sky-500">
        <LoaderCircle size={36} className="animate-spin" />
      </div>
    );
  }
  if (state === "login") return <Login onSuccess={() => setState("ready")} />;

  // Any request that comes back 401 means the session expired.
  const onUnauthorized = () => setState("login");

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-sky-700">Team</p>
          <h1 className="mt-1 text-4xl font-bold text-slate-900">Admin panel</h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-md border-2 border-slate-200 px-5 py-2.5 font-medium text-slate-700 transition hover:border-sky-300"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>

      <div className="mt-10 flex max-w-full gap-2 overflow-x-auto rounded-md bg-slate-100 p-1.5 sm:inline-flex">
        <TabButton active={tab === "enquiries"} onClick={() => setTab("enquiries")} icon={<Inbox size={20} />} label="Client enquiries" />
        <TabButton active={tab === "ongoing"} onClick={() => setTab("ongoing")} icon={<Construction size={20} />} label="Ongoing projects" />
        <TabButton active={tab === "projects"} onClick={() => setTab("projects")} icon={<FolderCheck size={20} />} label="Completed projects" />
      </div>

      <div className="mt-10 animate-[fade-in_250ms_ease-out]" key={tab}>
        {tab === "enquiries" && <EnquiriesTab onUnauthorized={onUnauthorized} />}
        {tab === "ongoing" && <OngoingTab onUnauthorized={onUnauthorized} />}
        {tab === "projects" && <ProjectsTab onUnauthorized={onUnauthorized} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-md px-5 py-2.5 font-medium transition-all duration-200 ${
        active ? "bg-white text-sky-700" : "text-slate-600 hover:text-sky-700"
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
    <div className="bg-sky-50 grid min-h-[75vh] place-items-center px-5 py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-10">
        <span className="grid h-14 w-14 place-items-center rounded-md bg-sky-600 text-white">
          <LockKeyhole size={28} />
        </span>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Owner login</h1>
        <p className="mt-1 text-slate-500">For the Alpha Automations owner and team.</p>
        <label htmlFor="password" className="mt-8 block font-medium text-slate-700">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
        {error && <p className="mt-3 text-red-600">{error}</p>}
        <div className="mt-8 [&>button]:w-full">
          <PrimaryButton disabled={busy}>{busy ? "Logging in..." : "Log in"}</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
