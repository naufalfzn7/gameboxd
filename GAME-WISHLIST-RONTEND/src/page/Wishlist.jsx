import React, { useState } from "react";
import {
  useGetWishListQuery,
  useRemoveFromWishListByIdMutation,
  useUpdateWishListByIdMutation,
} from "../services/wishListApi";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaCheckCircle, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import LoadingOverlay from "../components/LoadingOverlay";

const Wishlist = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useGetWishListQuery();
  const [removeFromWishList, { isLoading: isRemoving }] =
    useRemoveFromWishListByIdMutation();
  const [updateWishList, { isLoading: isUpdating }] =
    useUpdateWishListByIdMutation();
  const [processingId, setProcessingId] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const wishlistItems = data?.data || [];

  // Status configuration
  const statusConfig = {
    PENDING: {
      label: "Pending",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      icon: FaClock,
      nextStatus: "PURCHASED",
    },
    PURCHASED: {
      label: "Purchased",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      icon: FaCheckCircle,
      nextStatus: "PENDING",
    },
    REMOVED: {
      label: "Removed",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      icon: FaTrash,
      nextStatus: "PENDING",
    },
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.PENDING;
  };

  const getStatusButtonText = (currentStatus) => {
    const config = getStatusConfig(currentStatus);
    const nextStatus = config.nextStatus;
    const nextLabel = statusConfig[nextStatus].label;
    return `Mark as ${nextLabel}`;
  };

  const handleRemoveFromWishList = async (wishListId, gameTitle) => {
    Swal.fire({
      title: "Remove from Wishlist?",
      text: `Are you sure you want to remove "${gameTitle}" from your wishlist?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setProcessingId(wishListId);
        setLoadingMessage(`Removing "${gameTitle}" from wishlist...`);
        try {
          await removeFromWishList(wishListId).unwrap();
          setLoadingMessage("");
          Swal.fire(
            "Removed!",
            `${gameTitle} has been removed from your wishlist.`,
            "success",
          );
        } catch (err) {
          setLoadingMessage("");
          Swal.fire("Error!", "Failed to remove from wishlist.", "error");
          console.error("Remove from wishlist failed:", err);
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleUpdateStatus = async (wishListId, currentStatus, gameTitle) => {
    const config = getStatusConfig(currentStatus);
    const newStatus = config.nextStatus;
    const nextLabel = statusConfig[newStatus].label;

    setProcessingId(wishListId);
    setLoadingMessage(
      `Updating "${gameTitle}" to ${nextLabel.toLowerCase()}...`,
    );
    try {
      await updateWishList({ wishListId, status: newStatus }).unwrap();
      setLoadingMessage("");
      Swal.fire(
        "Success!",
        `${gameTitle} has been marked as ${nextLabel.toLowerCase()}.`,
        "success",
      );
    } catch (err) {
      setLoadingMessage("");
      console.error("Update status error:", err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to update wishlist status.";
      Swal.fire("Error!", errorMessage, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGameClick = (gameId) => {
    navigate(`/gamelist/${gameId}`);
  };

  if (isLoading) {
    return (
      <LoadingOverlay
        isLoading={true}
        message="Loading your wishlist..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error loading wishlist</p>
          <button
            onClick={() => navigate("/gamelist")}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors border border-gray-700"
          >
            Go to Game List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <LoadingOverlay isLoading={!!loadingMessage} message={loadingMessage} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length} game{wishlistItems.length !== 1 ? "s" : ""}{" "}
            in your wishlist
          </p>
        </header>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600 mb-6">Your wishlist is empty</p>
            <button
              onClick={() => navigate("/gamelist")}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold border border-gray-700"
            >
              Explore Games
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {(() => {
                  const game = item.game;
                  const hasGame = Boolean(game);
                  const releaseDateText = game?.releaseDate
                    ? new Date(game.releaseDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown";
                  return (
                    <div className="flex flex-col sm:flex-row gap-6 p-6">
                      {/* Game Image */}
                      <div
                        onClick={() => hasGame && handleGameClick(game.id)}
                        className={`flex-shrink-0 w-full sm:w-48 h-48 rounded-lg overflow-hidden bg-gray-200 ${
                          hasGame ? "cursor-pointer group" : "cursor-default"
                        }`}
                      >
                        <img
                          src={game?.urlPicture || "/images/game.jpg"}
                          alt={game?.title || "Game"}
                          className={`w-full h-full object-cover ${
                            hasGame
                              ? "group-hover:scale-110 transition-transform duration-300"
                              : ""
                          }`}
                        />
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h2
                            onClick={() => hasGame && handleGameClick(game.id)}
                            className={`text-2xl font-bold text-black mb-2 ${
                              hasGame
                                ? "cursor-pointer hover:text-gray-600 transition-colors"
                                : "cursor-default"
                            }`}
                          >
                            {game?.title || "Unknown game"}
                          </h2>

                          {/* Genres */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {game?.genre && game.genre.length > 0 ? (
                              game.genre.map((g, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full"
                                >
                                  {g}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">
                                No genre
                              </span>
                            )}
                          </div>

                          {/* Game Info */}
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold text-black">
                                Rating:
                              </span>{" "}
                              {typeof game?.rating === "number"
                                ? game.rating.toFixed(1)
                                : "Unknown"}
                            </p>
                            <p>
                              <span className="font-semibold text-black">
                                Released:
                              </span>{" "}
                              {releaseDateText}
                            </p>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {(() => {
                              const config = getStatusConfig(item.status);
                              const Icon = config.icon;
                              return (
                                <div
                                  className={`flex items-center gap-2 px-4 py-2 ${config.bgColor} rounded-lg`}
                                >
                                  <Icon className={config.textColor} />
                                  <span
                                    className={`text-sm font-semibold ${config.textColor}`}
                                  >
                                    {config.label}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 w-full sm:w-auto">
                            {/* Toggle Status Button */}
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  item.id,
                                  item.status,
                                  item.game.title,
                                )
                              }
                              disabled={isUpdating || processingId === item.id}
                              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors font-medium text-sm border ${
                                isUpdating || processingId === item.id
                                  ? "bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed"
                                  : "bg-gray-800 text-white border-gray-700 hover:bg-gray-900"
                              }`}
                            >
                              {processingId === item.id && isUpdating ? (
                                <span>Updating...</span>
                              ) : (
                                getStatusButtonText(item.status)
                              )}
                            </button>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                handleRemoveFromWishList(
                                  item.id,
                                  item.game.title,
                                )
                              }
                              disabled={isRemoving || processingId === item.id}
                              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                                isRemoving || processingId === item.id
                                  ? "bg-red-400 text-red-100 cursor-not-allowed"
                                  : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                            >
                              <FaTrash className="text-sm" />
                              <span>
                                {processingId === item.id && isRemoving
                                  ? "Removing..."
                                  : "Remove"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
