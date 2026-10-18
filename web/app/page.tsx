export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-orange-400">
          Alpha Automations · Moving forward
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
          Industrial automation machines, built from the genba.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          We go to your shop floor, study the real problem, and build complete
          automated machines and PLC control panels for consistency and maximum
          output.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#services"
            className="rounded-lg bg-orange-500 px-6 py-3 font-semibold hover:bg-orange-600"
          >
            Our Services
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-slate-500 px-6 py-3 font-semibold hover:bg-slate-800"
          >
            Request a Quote
          </a>
        </div>
      </section>
    </main>
  );
}
