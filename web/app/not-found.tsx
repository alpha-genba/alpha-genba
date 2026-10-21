import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-orange-400">404</p>
      <h1 className="mt-3 text-3xl font-bold">This page isn&apos;t on our shop floor</h1>
      <p className="mt-3 text-slate-400">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-8 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-orange-400">
        Back to home
      </Link>
    </div>
  );
}
