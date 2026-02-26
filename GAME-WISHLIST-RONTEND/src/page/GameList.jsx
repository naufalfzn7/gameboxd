import React, { useEffect, useState } from "react";
import { useGetGamesQuery } from "../services/gameApi";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import LoadingOverlay from "../components/LoadingOverlay";

const GameList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, error, isLoading } = useGetGamesQuery({
    page: currentPage,
    limit,
    search: searchQuery,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleClick = (gameId) => {
    navigate(`/gamelist/${gameId}`);
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} message="Loading games..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 px-4">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center max-w-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3">
            Error Loading Games
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Something went wrong while loading games. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const games = data?.data || [];

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 mb-2">
            Game Library
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mb-6 sm:mb-8">
            Discover your next favorite game
          </p>

          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-neutral-300 w-full max-w-md focus-within:border-black focus-within:ring-1 focus-within:ring-black">
            <FaSearch className="text-neutral-400 text-base sm:text-lg" />
            <input
              type="text"
              placeholder="Search games by title..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-neutral-900 placeholder-neutral-400"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-neutral-600">
              {searchInput ? "No games match your search" : "No games found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="group h-full bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border border-neutral-200"
              >
                {/* Image Container */}
                <div
                  onClick={() => handleClick(game.id)}
                  className="relative overflow-hidden bg-neutral-200 h-48 sm:h-64"
                >
                  <img
                    src={game.urlPicture || "/images/game.jpg"}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Content Container */}
                <div className="p-5 flex flex-col h-full">
                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 line-clamp-2 group-hover:text-neutral-600 transition-colors">
                    {game.title}
                  </h2>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {game.genre && game.genre.length > 0 ? (
                      game.genre.map((g, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 sm:px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-full"
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-500">No genre</span>
                    )}
                  </div>

                  {/* Release Date */}
                  <div className="mt-auto pt-3 border-t border-neutral-200">
                    <p className="text-xs sm:text-sm text-neutral-600">
                      <span className="font-semibold text-neutral-900">
                        Released:{" "}
                      </span>
                      {game.releaseDate
                        ? new Date(game.releaseDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {games.length > 0 && data?.pagination && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Pagination Info */}
            <div className="text-xs sm:text-sm text-neutral-600">
              Showing{" "}
              <span className="font-semibold text-neutral-900">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-neutral-900">
                {Math.min(currentPage * limit, data.pagination.totalGames)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-neutral-900">
                {data.pagination.totalGames}
              </span>{" "}
              games
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>

              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: data.pagination.totalPages },
                  (_, i) => i + 1,
                )
                  .filter((page) => {
                    // Show first page, last page, current page, and adjacent pages
                    return (
                      page === 1 ||
                      page === data.pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {/* Add ellipsis if there's a gap */}
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-1 text-neutral-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-black text-white border border-black"
                            : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, data.pagination.totalPages),
                  )
                }
                disabled={currentPage === data.pagination.totalPages}
                className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => setCurrentPage(data.pagination.totalPages)}
                disabled={currentPage === data.pagination.totalPages}
                className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="limit"
                className="text-xs sm:text-sm text-neutral-600"
              >
                Per page:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing limit
                }}
                className="px-3 py-2 text-xs sm:text-sm border border-neutral-300 rounded-lg bg-white text-neutral-700 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameList;
