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
      <LoadingOverlay isLoading={true} message="Loading your wishlist..." />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 px-4">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center max-w-sm">
          <p className="text-base sm:text-lg text-red-600 mb-6 font-semibold">
            Error loading wishlist
          </p>
          <button
            onClick={() => navigate("/gamelist")}
            className="w-full px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:opacity-90 active:scale-95 transition font-semibold text-sm sm:text-base border border-black"
          >
            Go to Game List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 lg:px-8">
      <LoadingOverlay isLoading={!!loadingMessage} message={loadingMessage} />
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-neutral-900 mb-2">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            {wishlistItems.length} game{wishlistItems.length !== 1 ? "s" : ""}{" "}
            in your wishlist
          </p>
        </header>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-sm sm:text-base text-neutral-600 mb-6 sm:mb-8">
              Your wishlist is empty
            </p>
            <button
              onClick={() => navigate("/gamelist")}
              className="px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:opacity-90 active:scale-95 transition font-semibold text-sm sm:text-base border border-black"
            >
              Explore Games
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-200 rounded-lg sm:rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 shadow-lg"
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
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                      {/* Game Image */}
                      <div
                        onClick={() => hasGame && handleGameClick(game.id)}
                        className={`flex-shrink-0 w-full sm:w-40 md:w-48 h-40 sm:h-48 rounded-lg overflow-hidden bg-neutral-200 ${
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
                            className={`text-lg sm:text-2xl font-bold text-neutral-900 mb-2 break-words ${
                              hasGame
                                ? "cursor-pointer hover:text-neutral-600 transition-colors"
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
                                  className="inline-block px-2 sm:px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-full"
                                >
                                  {g}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-neutral-500">
                                No genre
                              </span>
                            )}
                          </div>

                          {/* Game Info */}
                          <div className="space-y-1 text-xs sm:text-sm text-neutral-600">
                            <p>
                              <span className="font-semibold text-neutral-900">
                                Rating:
                              </span>{" "}
                              {typeof game?.rating === "number"
                                ? game.rating.toFixed(1)
                                : "Unknown"}
                            </p>
                            <p>
                              <span className="font-semibold text-neutral-900">
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
                                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${config.bgColor} rounded-lg`}
                                >
                                  <Icon
                                    className={`${config.textColor} text-sm sm:text-base`}
                                  />
                                  <span
                                    className={`text-xs sm:text-sm font-semibold ${config.textColor}`}
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
                              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors font-medium text-xs sm:text-sm border ${
                                isUpdating || processingId === item.id
                                  ? "bg-neutral-300 text-neutral-600 border-neutral-400 cursor-not-allowed"
                                  : "bg-black text-white border-black hover:opacity-90 active:scale-95"
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
                              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors font-medium text-xs sm:text-sm flex items-center justify-center gap-2 ${
                                isRemoving || processingId === item.id
                                  ? "bg-red-200 text-red-600 cursor-not-allowed"
                                  : "bg-red-600 text-white hover:opacity-90 active:scale-95"
                              }`}
                            >
                              <FaTrash className="text-xs sm:text-sm" />
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
