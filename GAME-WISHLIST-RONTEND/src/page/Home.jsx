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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
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
    <div className="min-h-screen bg-white p-5">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg mb-8 border border-gray-700">
        <h1 className="text-4xl font-bold mb-2">
          {timeGreeting()}, {user?.name}! 👋
        </h1>
        <p className="text-lg opacity-90">
          Welcome to your Game Wishlist Dashboard
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Latest Wishlist */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Latest Added</h3>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaShoppingCart className="text-blue-600 text-xl" />
            </div>
          </div>
          {latestWishlist?.game ? (
            <>
              <p className="text-lg font-semibold text-black line-clamp-1">
                {latestWishlist.game.title || "Untitled game"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
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
              <p className="text-lg font-semibold text-black">No wishlist</p>
              <p className="text-sm text-gray-500 mt-2">
                Add your first game to get started
              </p>
            </>
          )}
        </div>

        {/* Wishlist Count */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">My Wishlist</h3>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaHeart className="text-red-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{stats.wishlistCount}</p>
          <p className="text-sm text-gray-500 mt-2">Games in wishlist</p>
        </div>

        {/* Pending Games */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Pending</h3>
            <div className="bg-amber-100 p-3 rounded-lg">
              <FaClock className="text-amber-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-black">{stats.pendingCount}</p>
          <p className="text-sm text-gray-500 mt-2">Games to purchase</p>
        </div>

        {/* Purchased Games */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-semibold">Purchased</h3>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaTrophy className="text-green-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-black">
            {stats.purchasedCount}
          </p>
          <p className="text-sm text-gray-500 mt-2">Games owned</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Wishlist */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-800 text-white p-6 flex items-center justify-between border-b border-gray-600">
              <h2 className="text-2xl font-bold">Recent Wishlist</h2>
              <FaFire className="text-xl" />
            </div>

            {recentWishlist.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentWishlist.map((item) => {
                  const game = item.game;
                  const hasGame = Boolean(game);
                  const content = (
                    <div className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                      <img
                        src={game?.urlPicture || "/images/game.jpg"}
                        alt={game?.title || "Game"}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-black hover:text-gray-600 transition-colors">
                          {game?.title || "Unknown game"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
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
                            <span className="text-xs text-gray-500">
                              {game.genre[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <FaArrowRight className="text-gray-400" />
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
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">No games in your wishlist yet</p>
                <Link
                  to="/gamelist"
                  className="inline-block px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors border border-gray-700"
                >
                  Explore Games
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-black mb-6">Quick Stats</h2>

          {/* Favorite Genre */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm text-gray-600 font-semibold mb-2">
              Favorite Genre
            </h3>
            {stats.favoriteGenre ? (
              <p className="text-2xl font-bold text-gray-800">
                {stats.favoriteGenre}
              </p>
            ) : (
              <p className="text-gray-500">No genre data yet</p>
            )}
          </div>

          {/* Status Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-600 font-semibold mb-4">
              Wishlist Breakdown
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Pending</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.pendingCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
                  <span className="text-sm text-gray-700">Purchased</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.purchasedCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
              className="block w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all font-semibold border border-gray-700"
            >
              Browse Games
            </Link>
            <Link
              to="/wishlist"
              className="block w-full px-4 py-2 border border-gray-400 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-center font-semibold"
            >
              View Wishlist
            </Link>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-black mb-4">
          Profile Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-lg font-semibold text-black">{user?.name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-black break-all">
              {user?.email}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Account Role</p>
            <p className="text-lg font-semibold text-gray-700 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
