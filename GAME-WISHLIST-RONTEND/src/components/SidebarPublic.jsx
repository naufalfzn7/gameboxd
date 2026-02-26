import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaGamepad,
  FaHome,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const SidebarPublic = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100"
    }`;
  return (
    <div>
      <div className="drawer lg:drawer-open">
        <input id="drawer-public" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Navbar */}
          <nav className="navbar w-full bg-white sticky top-0 z-10 border-b border-neutral-200">
            <label
              htmlFor="drawer-public"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost text-neutral-700"
            >
              {/* Sidebar toggle icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="my-1.5 inline-block size-4"
              >
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </label>
            <div className="flex items-center gap-2 px-4 font-semibold">
              <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center">
                <FaGamepad className="text-white text-lg" />
              </div>
              <span className="text-neutral-900">Gamebox'd</span>
            </div>
          </nav>
          {/* Page content here */}
          <div className="p-2 sm:p-4 bg-neutral-100 min-h-[calc(100vh-64px)]">
            <Outlet />
          </div>
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible sticky top-0 h-screen">
          <label
            htmlFor="drawer-public"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="flex min-h-full flex-col items-start bg-white is-drawer-close:w-14 is-drawer-open:w-64 sticky top-0 border-r border-neutral-200">
            {/* Sidebar Logo */}
            <div className="flex items-center justify-center w-full py-4 border-b border-neutral-200">
              <div className="flex items-center gap-3 is-drawer-close:justify-center">
                <div className="bg-black p-2 rounded-lg">
                  <FaGamepad className="text-white text-xl" />
                </div>
                <span className="font-bold text-lg text-neutral-900 is-drawer-close:hidden">
                  Gamebox'd
                </span>
              </div>
            </div>
            {/* Sidebar content here */}
            <ul className="w-full grow space-y-1 px-2 py-4">
              <li>
                <NavLink to="/" className={navLinkClass}>
                  <FaHome className="text-lg" />
                  <span className="is-drawer-close:hidden">Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className={navLinkClass}>
                  <FaSignInAlt className="text-lg" />
                  <span className="is-drawer-close:hidden">Login</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={navLinkClass}>
                  <FaUserPlus className="text-lg" />
                  <span className="is-drawer-close:hidden">Register</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarPublic;
