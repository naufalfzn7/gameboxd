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
    return (
      <LoadingOverlay
        isLoading={true}
        message="Loading games..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-error">Error loading games</div>
      </div>
    );
  }

  const games = data?.data || [];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-2">Game Library</h1>
          <p className="text-gray-600">Discover your next favorite game</p>

          {/* Search Bar */}
          <div className="mt-6 flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 w-full max-w-md">
            <FaSearch className="text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search games by title..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="flex-1 bg-transparent outline-none text-black placeholder-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              {searchInput ? "No games match your search" : "No games found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="group h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-100"
              >
                {/* Image Container */}
                <div
                  onClick={() => handleClick(game.id)}
                  className="relative overflow-hidden bg-gray-200 h-64"
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
                  <h2 className="text-lg font-bold text-black mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors">
                    {game.title}
                  </h2>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {game.genre && game.genre.length > 0 ? (
                      game.genre.map((g, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full"
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No genre</span>
                    )}
                  </div>

                  {/* Release Date */}
                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-black">
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
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-black">
                {(currentPage - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-black">
                {Math.min(currentPage * limit, data.pagination.totalGames)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-black">
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
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>

              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-gray-800 text-white border border-gray-700"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
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
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => setCurrentPage(data.pagination.totalPages)}
                disabled={currentPage === data.pagination.totalPages}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="limit" className="text-sm text-gray-600">
                Per page:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing limit
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
