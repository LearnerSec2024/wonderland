import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Outlet />

      <footer className="border-t border-white/10 bg-slate-950 px-6 py-8 text-center text-sm text-white/60">
        <p>Wonderland learning app • Built with React, Node.js and SQL Server</p>
      </footer>
    </div>
  );
}

export default Layout;

