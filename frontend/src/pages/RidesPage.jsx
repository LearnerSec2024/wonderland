function RidesPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="rides-page">
      <p className="font-bold uppercase tracking-[0.25em] text-cyan-300">Adventure catalogue</p>
      <h1 className="mt-3 text-5xl font-black">Rides</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/70">
        This page will become the full rides listing with search, filters, loading states and booking actions.
      </p>

      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6">
        <p className="text-white/80">
          Iteration 3 will expand this page into a proper searchable rides catalogue.
        </p>
      </div>
    </main>
  );
}

export default RidesPage;

