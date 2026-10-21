import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-sky-50 flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="text-7xl font-bold text-sky-300">404</p>
      <h1 className="mt-4 text-4xl font-bold text-slate-900">This page isn&apos;t on our shop floor</h1>
      <p className="mt-4 max-w-md text-lg text-slate-600">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-10 rounded-md bg-sky-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-700">
        Back to home
      </Link>
    </div>
  );
}
