import React from "react";

const LoadingOverlay = ({ isLoading, message = "Processing..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[300px] border border-gray-700">
        {/* Animated Spinner */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-500 rounded-full animate-spin-slow"></div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
          <p className="text-sm text-gray-400">Please wait a moment...</p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
