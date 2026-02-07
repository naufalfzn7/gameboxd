import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetGameByIdQuery } from "../services/gameApi";
import { useAddToWishListMutation } from "../services/wishListApi";
import Swal from "sweetalert2";

const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetGameByIdQuery(gameId);
  const [addToWishList, { isLoading: isAdding }] = useAddToWishListMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">
            Error loading game details
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors border border-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const game = data?.data;

  const handleAddToWishList = async () => {
    try {
      await addToWishList(gameId).unwrap();
      Swal.fire(
        "Success!",
        `${game.title} has been added to your wishlist.`,
        "success"
      );
    } catch (err) {
      console.error("Add to wishlist error:", err);
      const errorMessage =
        err?.data?.message || err?.message || "Failed to add to wishlist.";
      Swal.fire("Error!", errorMessage, "error");
    }
  };

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-4">Game not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors border border-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back to Games</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={game.urlPicture}
                alt={game.title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Rating Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">User Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(game.rating)
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-white">
                      {game.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">/ 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex flex-col">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {game.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {game.genre.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg border border-gray-700 hover:bg-gray-900 transition-colors"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                About This Game
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {game.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Developer */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">
                    Developer
                  </p>
                </div>
                <p className="text-white text-lg font-semibold">
                  {game.developer}
                </p>
              </div>

              {/* Publisher */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">
                    Publisher
                  </p>
                </div>
                <p className="text-white text-lg font-semibold">
                  {game.publisher}
                </p>
              </div>

              {/* Release Date */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">
                    Release Date
                  </p>
                </div>
                <p className="text-white text-lg font-semibold">
                  {new Date(game.releaseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Added Date */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">
                    Added to Library
                  </p>
                </div>
                <p className="text-white text-lg font-semibold">
                  {new Date(game.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={handleAddToWishList}
                disabled={isAdding}
                className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                {isAdding ? "Adding..." : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
