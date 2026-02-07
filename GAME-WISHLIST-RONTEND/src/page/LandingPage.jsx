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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white px-4">
        <h1 className="mb-5 text-5xl md:text-6xl font-extrabold tracking-wide leading-snug drop-shadow-lg">
          Hello there
        </h1>
        <p className="mb-5 max-w-lg text-lg md:text-xl drop-shadow-md">
          Welcome to Game Wishlist, your ultimate destination to track and
          manage your favorite video games. Create your wishlist and never miss
          out on the games you love!
        </p>
        <Link to="/register">
          <button className="btn btn-primary btn-lg drop-shadow-md">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
