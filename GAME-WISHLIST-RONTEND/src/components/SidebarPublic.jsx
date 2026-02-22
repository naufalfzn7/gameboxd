import React from "react";
import { Link, Outlet } from "react-router-dom";
import {
  FaGamepad,
  FaHome,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const SidebarPublic = () => {
  return (
    <div>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Navbar */}
          <nav className="navbar w-full bg-base-300 sticky top-0 z-10">
            <label
              htmlFor="my-drawer-4"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
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
              <FaGamepad className="text-xl text-gray-300" />
              <span>Game Wishlist</span>
            </div>
          </nav>
          {/* Page content here */}
          <div className="p-1">
            <Outlet />
          </div>
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible sticky top-0 h-screen">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64 sticky top-0">
            {/* Sidebar Logo */}
            <div className="flex items-center justify-center w-full py-4 border-b border-base-300">
              <div className="flex items-center gap-3 is-drawer-close:justify-center">
                <div className="bg-gray-800 p-2 rounded-lg border border-gray-600">
                  <FaGamepad className="text-white text-xl" />
                </div>
                <span className="font-bold text-lg is-drawer-close:hidden">
                  Game Wishlist
                </span>
              </div>
            </div>
            {/* Sidebar content here */}
            <ul className="menu w-full grow">
              {/* List item */}
              <Link to="/">
                <li>
                  <button
                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                    data-tip="Home Page"
                  >
                    <FaHome className="text-lg" />
                    <span className="is-drawer-close:hidden">Home</span>
                  </button>
                </li>
              </Link>
              <Link to="/login">
                <li>
                  <button
                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                    data-tip="Login Page"
                  >
                    <FaSignInAlt className="text-lg" />
                    <span className="is-drawer-close:hidden">Login</span>
                  </button>
                </li>
              </Link>

              {/* List item */}
              <Link to="/register">
                <li>
                  <button
                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                    data-tip="Register Page"
                  >
                    <FaUserPlus className="text-lg" />
                    <span className="is-drawer-close:hidden">Register</span>
                  </button>
                </li>
              </Link>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarPublic;
