import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <img
        src="/images/landing.jpg"
        alt="Landing"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Solid overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 sm:mb-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide leading-snug drop-shadow-lg">
          Hello there
        </h1>
        <p className="mb-6 sm:mb-8 max-w-lg text-base sm:text-lg md:text-xl drop-shadow-md">
          Welcome to Game Wishlist, your ultimate destination to track and
          manage your favorite video games. Create your wishlist and never miss
          out on the games you love!
        </p>
        <Link to="/register" className="cursor-pointer hover:bg-amber-100">
          <button className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-black font-semibold rounded-lg hover:opacity-90 active:scale-95 transition text-base sm:text-lg drop-shadow-lg border border-black cursor-pointer">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
