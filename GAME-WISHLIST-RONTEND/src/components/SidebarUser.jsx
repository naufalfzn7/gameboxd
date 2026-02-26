import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../services/authApi";
import { logoutSlice } from "../features/authSlice";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { FaGamepad, FaHome, FaUser, FaSignOutAlt } from "react-icons/fa";
import { SiWish } from "react-icons/si";

const SidebarUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await logout().unwrap();
          dispatch(logoutSlice());
          navigate("/login");
          Swal.fire("Logged out!", "You have been logged out.", "success");
        } catch (err) {
          console.error("Logout failed:", err);
          alert("Logout failed");
        }
      }
    });
  };

  if (isLoading) {
    return <div>Logging out...</div>;
  }
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100"
    }`;

  const handleNavClick = () => {
    // Close sidebar on mobile after clicking nav link
    setIsOpen(false);
  };
  return (
    <div className="h-screen bg-neutral-100 overflow-hidden">
      <div className="flex h-full">
        <div
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-neutral-200 transform transition-transform md:static md:translate-x-0 flex flex-col ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
              <FaGamepad className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold text-neutral-900">
              Gamebox'd
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
            <NavLink
              to="/dashboard"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <FaHome className="text-lg" />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <FaUser className="text-lg" />
              <span>Profile</span>
            </NavLink>
            <NavLink
              to="/gamelist"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <FaGamepad className="text-lg" />
              <span>Game List</span>
            </NavLink>
            <NavLink
              to="/wishlist"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <SiWish className="text-lg" />
              <span>Wishlist</span>
            </NavLink>
          </nav>

          <div className="border-t border-neutral-200 px-3 py-4 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
          <header className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-neutral-200 px-4 py-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-700 hover:bg-neutral-50"
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

          <main className="flex-1 overflow-y-auto p-2 sm:p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SidebarUser;
