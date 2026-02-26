import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-neutral-200 p-8 sm:p-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
          Unauthorized Access
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 mb-8">
          You do not have permission to view this page.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:opacity-90 active:scale-95 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
