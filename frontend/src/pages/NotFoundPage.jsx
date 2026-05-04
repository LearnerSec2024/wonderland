import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-14 text-center" data-testid="not-found-page">
      <section>
        <p className="text-7xl">??</p>
        <h1 className="mt-6 text-5xl font-black">Page not found</h1>
        <p className="mt-4 text-white/70">
          Looks like this ride track does not exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-yellow-300 px-6 py-3 font-black text-slate-950"
          data-testid="not-found-home-link"
        >
          Back to homepage
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;

