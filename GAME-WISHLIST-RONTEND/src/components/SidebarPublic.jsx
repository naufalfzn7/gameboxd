import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaGamepad, FaHome, FaSignInAlt, FaUserPlus } from "react-icons/fa";

const SidebarPublic = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when sidebar is open on mobile
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors touch-manipulation ${
      isActive
        ? "bg-black text-white"
        : "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200"
    }`;

  const handleNavClick = () => {
    // Close sidebar on mobile after clicking nav link
    setIsOpen(false);
  };
  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
      <div
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-neutral-200 shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
            <FaGamepad className="text-white text-lg" />
          </div>
          <span className="text-lg font-bold text-neutral-900">Gamebox'd</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
          <NavLink to="/" className={navLinkClass} onClick={handleNavClick}>
            <FaHome className="text-lg" />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/login"
            className={navLinkClass}
            onClick={handleNavClick}
          >
            <FaSignInAlt className="text-lg" />
            <span>Login</span>
          </NavLink>
          <NavLink
            to="/register"
            className={navLinkClass}
            onClick={handleNavClick}
          >
            <FaUserPlus className="text-lg" />
            <span>Register</span>
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col w-full md:w-auto">
        <header className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-neutral-200 px-4 py-3 md:hidden z-10">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
            aria-label="Open sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              fill="none"
              stroke="currentColor"
              className="size-4"
            >
              <path d="M4 6h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 18h16"></path>
            </svg>
          </button>
          <div className="flex items-center gap-2 font-semibold text-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <FaGamepad className="text-white text-sm" />
            </div>
            <span>Gamebox'd</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-neutral-50 md:bg-neutral-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarPublic;
