import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useGetWishListQuery } from "../services/wishListApi";
import {
  FaHeart,
  FaTrophy,
  FaClock,
  FaShoppingCart,
  FaFire,
  FaArrowRight,
} from "react-icons/fa";
import LoadingOverlay from "../components/LoadingOverlay";

const Home = () => {
  const user = useSelector((state) => state.auth.user);
  const { data: wishlistData } = useGetWishListQuery();

  const wishlistItems = wishlistData?.data || [];

  // Calculate statistics
  const stats = useMemo(() => {
    const pendingCount = wishlistItems.filter(
      (item) => item.status === "PENDING",
    ).length;
    const purchasedCount = wishlistItems.filter(
      (item) => item.status === "PURCHASED",
    ).length;

    // Get most common genre from wishlist
    const genreCounts = {};
    wishlistItems.forEach((item) => {
      if (item.game.genre && Array.isArray(item.game.genre)) {
        item.game.genre.forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    const favoriteGenre = Object.entries(genreCounts).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    return {
      wishlistCount: wishlistItems.length,
      pendingCount,
      purchasedCount,
      favoriteGenre,
    };
  }, [wishlistItems]);

  const latestWishlist = useMemo(() => {
    if (!wishlistItems.length) return null;
    return [...wishlistItems].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })[0];
  }, [wishlistItems]);

  if (!user) {
    return (
      <LoadingOverlay isLoading={true} message="Loading your dashboard..." />
    );
  }

  const recentWishlist = wishlistItems.slice(0, 3);
  const timeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-black text-white p-6 sm:p-8 lg:p-10 rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl mb-6 sm:mb-8 border border-neutral-800">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            {timeGreeting()}, {user?.name}! 👋
          </h1>
          <p className="text-sm sm:text-base opacity-90">
            Welcome to your Game Wishlist Dashboard
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Latest Wishlist */}
          <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-600">
                Latest Added
              </h3>
              <div className="bg-blue-100 p-2.5 sm:p-3 rounded-lg">
                <FaShoppingCart className="text-blue-600 text-base sm:text-lg" />
              </div>
            </div>
            {latestWishlist?.game ? (
              <>
                <p className="text-base sm:text-lg font-semibold text-neutral-900 line-clamp-1">
                  {latestWishlist.game.title || "Untitled game"}
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                  Added{" "}
                  {latestWishlist.createdAt
                    ? new Date(latestWishlist.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : "recently"}
                </p>
              </>
            ) : (
              <>
                <p className="text-base sm:text-lg font-semibold text-neutral-900">
                  No wishlist
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                  Add your first game to get started
                </p>
              </>
            )}
          </div>

          {/* Wishlist Count */}
          <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-600">
                My Wishlist
              </h3>
              <div className="bg-red-100 p-2.5 sm:p-3 rounded-lg">
                <FaHeart className="text-red-600 text-base sm:text-lg" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {stats.wishlistCount}
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              Games in wishlist
            </p>
          </div>

          {/* Pending Games */}
          <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-600">
                Pending
              </h3>
              <div className="bg-amber-100 p-2.5 sm:p-3 rounded-lg">
                <FaClock className="text-amber-600 text-base sm:text-lg" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {stats.pendingCount}
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              Games to purchase
            </p>
          </div>

          {/* Purchased Games */}
          <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-600">
                Purchased
              </h3>
              <div className="bg-green-100 p-2.5 sm:p-3 rounded-lg">
                <FaTrophy className="text-green-600 text-base sm:text-lg" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-neutral-900">
              {stats.purchasedCount}
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              Games owned
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Recent Wishlist */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-black text-white p-5 sm:p-6 flex items-center justify-between border-b border-neutral-700">
                <h2 className="text-lg sm:text-2xl font-bold">
                  Recent Wishlist
                </h2>
                <FaFire className="text-base sm:text-lg" />
              </div>

              {recentWishlist.length > 0 ? (
                <div className="divide-y divide-neutral-200">
                  {recentWishlist.map((item) => {
                    const game = item.game;
                    const hasGame = Boolean(game);
                    const content = (
                      <div className="p-4 hover:bg-neutral-50 transition-colors flex items-center gap-4">
                        <img
                          src={game?.urlPicture || "/images/game.jpg"}
                          alt={game?.title || "Game"}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 hover:text-neutral-600 transition-colors text-sm sm:text-base break-words">
                            {game?.title || "Unknown game"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                item.status === "PURCHASED"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "PENDING"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status}
                            </span>
                            {game?.genre && (
                              <span className="text-xs text-neutral-500">
                                {game.genre[0]}
                              </span>
                            )}
                          </div>
                        </div>
                        <FaArrowRight className="text-neutral-400 flex-shrink-0" />
                      </div>
                    );

                    return hasGame ? (
                      <Link
                        key={item.id}
                        to={`/gamelist/${game.id}`}
                        className="block"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={item.id} className="block">
                        {content}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  <p className="mb-4 text-sm sm:text-base">
                    No games in your wishlist yet
                  </p>
                  <Link
                    to="/gamelist"
                    className="inline-block px-6 py-2.5 bg-black text-white rounded-lg hover:opacity-90 active:scale-95 transition font-semibold text-sm sm:text-base border border-black"
                  >
                    Explore Games
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-6">
              Quick Stats
            </h2>

            {/* Favorite Genre */}
            <div className="mb-6 pb-6 border-b border-neutral-200">
              <h3 className="text-xs sm:text-sm text-neutral-600 font-semibold mb-2">
                Favorite Genre
              </h3>
              {stats.favoriteGenre ? (
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {stats.favoriteGenre}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-neutral-500">
                  No genre data yet
                </p>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="mb-6">
              <h3 className="text-xs sm:text-sm text-neutral-600 font-semibold mb-4">
                Wishlist Breakdown
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs sm:text-sm text-neutral-700">
                      Pending
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                      {stats.pendingCount}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.wishlistCount > 0
                            ? (stats.pendingCount / stats.wishlistCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs sm:text-sm text-neutral-700">
                      Purchased
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-neutral-900">
                      {stats.purchasedCount}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          stats.wishlistCount > 0
                            ? (stats.purchasedCount / stats.wishlistCount) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/gamelist"
                className="block w-full px-4 py-2 sm:py-2.5 bg-black text-white rounded-lg hover:opacity-90 transition-all font-semibold text-xs sm:text-sm text-center border border-black"
              >
                Browse Games
              </Link>
              <Link
                to="/wishlist"
                className="block w-full px-4 py-2 sm:py-2.5 border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors text-center font-semibold text-xs sm:text-sm"
              >
                View Wishlist
              </Link>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-neutral-600">Name</p>
              <p className="text-sm sm:text-lg font-semibold text-neutral-900 mt-1 break-words">
                {user?.name}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-neutral-600">Email</p>
              <p className="text-sm sm:text-lg font-semibold text-neutral-900 mt-1 break-all">
                {user?.email}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-neutral-600">
                Account Role
              </p>
              <p className="text-sm sm:text-lg font-semibold text-neutral-700 capitalize mt-1">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
