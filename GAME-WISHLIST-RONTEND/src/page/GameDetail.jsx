import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetGameByIdQuery } from "../services/gameApi";
import { useAddToWishListMutation } from "../services/wishListApi";
import { useMeQuery } from "../services/usersApi";
import {
  useAddReviewMutation,
  useDeleteReviewMutation,
  useGetReviewsByGameQuery,
  useUpdateReviewMutation,
} from "../services/reviewApi";
import Swal from "sweetalert2";
import LoadingOverlay from "../components/LoadingOverlay";

const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetGameByIdQuery(gameId);
  const [addToWishList, { isLoading: isAdding }] = useAddToWishListMutation();
  const token = useSelector((state) => state.auth.token);
  const { data: meData } = useMeQuery(undefined, { skip: !token });
  const meId = meData?.data?.id;

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useGetReviewsByGameQuery(gameId, { skip: !gameId || !token });
  const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation();
  const [updateReview, { isLoading: isUpdatingReview }] =
    useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeletingReview }] =
    useDeleteReviewMutation();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");
  const [processingReviewId, setProcessingReviewId] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Memoize computed values for better performance
  const game = useMemo(() => data?.data, [data]);
  const genres = useMemo(
    () => (Array.isArray(game?.genre) ? game.genre : []),
    [game?.genre],
  );
  const displayRating = useMemo(
    () => (typeof game?.rating === "number" ? game.rating : 0),
    [game?.rating],
  );

  const releaseDateText = useMemo(() => {
    if (!game?.releaseDate) return "Unknown";
    return new Date(game.releaseDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [game?.releaseDate]);

  const updatedDateText = useMemo(() => {
    if (!game?.rawg?.updated) return "Unknown";
    return new Date(game.rawg.updated).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [game?.rawg?.updated]);

  const platformNames = useMemo(() => {
    if (!Array.isArray(game?.platforms)) return "";
    return game.platforms
      .map((item) => item?.platform?.name)
      .filter(Boolean)
      .join(", ");
  }, [game?.platforms]);

  // Memoized handlers with useCallback for better performance
  const handleAddToWishList = useCallback(async () => {
    setLoadingMessage(`Adding "${game?.title}" to wishlist...`);
    try {
      await addToWishList(gameId).unwrap();
      setLoadingMessage("");
      Swal.fire(
        "Success!",
        `${game.title} has been added to your wishlist.`,
        "success",
      );
    } catch (err) {
      setLoadingMessage("");
      console.error("Add to wishlist error:", err);
      const errorMessage =
        err?.data?.message || err?.message || "Failed to add to wishlist.";
      Swal.fire("Error!", errorMessage, "error");
    }
  }, [addToWishList, gameId, game?.title]);

  const handleAddReview = useCallback(
    async (event) => {
      event.preventDefault();
      setLoadingMessage("Adding your review...");
      try {
        await addReview({
          gameId,
          rating,
          comment,
        }).unwrap();
        setRating(5);
        setComment("");
        setLoadingMessage("");
        Swal.fire("Success!", "Review added successfully.", "success");
      } catch (err) {
        setLoadingMessage("");
        const errorMessage =
          err?.data?.message || err?.message || "Failed to add review.";
        Swal.fire("Error!", errorMessage, "error");
      }
    },
    [addReview, gameId, rating, comment],
  );

  const handleStartEdit = useCallback((review) => {
    setEditingReviewId(review.id);
    setEditingRating(review.rating);
    setEditingComment(review.comment);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingReviewId(null);
    setEditingRating(5);
    setEditingComment("");
  }, []);

  const handleUpdateReview = useCallback(
    async (event) => {
      event.preventDefault();
      setProcessingReviewId(editingReviewId);
      setLoadingMessage("Updating your review...");
      try {
        await updateReview({
          reviewId: editingReviewId,
          rating: editingRating,
          comment: editingComment,
          gameId,
        }).unwrap();
        handleCancelEdit();
        setLoadingMessage("");
        Swal.fire("Success!", "Review updated successfully.", "success");
      } catch (err) {
        setLoadingMessage("");
        const errorMessage =
          err?.data?.message || err?.message || "Failed to update review.";
        Swal.fire("Error!", errorMessage, "error");
      } finally {
        setProcessingReviewId(null);
      }
    },
    [
      updateReview,
      editingReviewId,
      editingRating,
      editingComment,
      gameId,
      handleCancelEdit,
    ],
  );

  const handleDeleteReview = useCallback(
    async (reviewId) => {
      setProcessingReviewId(reviewId);
      setLoadingMessage("Deleting review...");
      try {
        await deleteReview({ reviewId, gameId }).unwrap();
        setLoadingMessage("");
        Swal.fire("Deleted!", "Review deleted successfully.", "success");
      } catch (err) {
        setLoadingMessage("");
        const errorMessage =
          err?.data?.message || err?.message || "Failed to delete review.";
        Swal.fire("Error!", errorMessage, "error");
      } finally {
        setProcessingReviewId(null);
      }
    },
    [deleteReview, gameId],
  );

  // Early returns for loading/error states
  if (isLoading) {
    return (
      <LoadingOverlay isLoading={true} message="Loading game details..." />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 px-4">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center max-w-sm">
          <p className="text-base sm:text-lg text-red-600 mb-6 font-semibold">
            Error loading game details
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:opacity-90 active:scale-95 transition font-semibold text-sm sm:text-base border border-black"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 px-4">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center max-w-sm">
          <p className="text-base sm:text-lg text-neutral-600 mb-6 font-semibold">
            Game not found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:opacity-90 active:scale-95 transition font-semibold text-sm sm:text-base border border-black"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <LoadingOverlay isLoading={!!loadingMessage} message={loadingMessage} />
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors group"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg sm:rounded-2xl shadow-lg sm:shadow-2xl">
              <img
                src={game.urlPicture || "/images/game.jpg"}
                alt={game.title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Rating Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-lg sm:rounded-xl p-4 border border-neutral-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-neutral-600 mb-1">
                    User Rating
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(displayRating)
                              ? "text-yellow-400"
                              : "text-neutral-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg sm:text-2xl font-bold text-neutral-900">
                      {displayRating.toFixed(1)}
                    </span>
                    <span className="text-xs sm:text-sm text-neutral-500">
                      / 5.0
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {game?.reviewCount > 0
                      ? `Based on ${game.reviewCount} user review${game.reviewCount !== 1 ? "s" : ""}`
                      : "No user reviews yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex flex-col">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
                {game.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.length > 0 ? (
                  genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-3 sm:px-4 py-2 bg-neutral-200 text-neutral-900 text-xs sm:text-sm font-semibold rounded-full shadow-md border border-neutral-300 hover:bg-neutral-300 transition-colors"
                    >
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="px-3 sm:px-4 py-2 bg-neutral-200 text-neutral-900 text-xs sm:text-sm font-semibold rounded-full shadow-md border border-neutral-300">
                    Unknown genre
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600"
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
              <p className="text-neutral-700 text-base sm:text-lg leading-relaxed">
                {game.description || "No description available."}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Platforms */}
              <div className="bg-white rounded-lg p-4 sm:p-5 border border-neutral-200 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-neutral-600"
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
                  <p className="text-xs sm:text-sm text-neutral-600 uppercase tracking-wider font-semibold">
                    Platforms
                  </p>
                </div>
                <p className="text-neutral-900 text-base sm:text-lg font-semibold">
                  {platformNames || "Unknown"}
                </p>
              </div>

              {/* ESRB */}
              <div className="bg-white rounded-lg p-4 sm:p-5 border border-neutral-200 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-neutral-600"
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
                  <p className="text-xs sm:text-sm text-neutral-600 uppercase tracking-wider font-semibold">
                    ESRB Rating
                  </p>
                </div>
                <p className="text-neutral-900 text-base sm:text-lg font-semibold">
                  {game?.esrbRating?.name || "Not rated"}
                </p>
              </div>

              {/* Release Date */}
              <div className="bg-white rounded-lg p-4 sm:p-5 border border-neutral-200 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-neutral-600"
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
                  <p className="text-xs sm:text-sm text-neutral-600 uppercase tracking-wider font-semibold">
                    Release Date
                  </p>
                </div>
                <p className="text-neutral-900 text-base sm:text-lg font-semibold">
                  {releaseDateText}
                </p>
              </div>

              {/* Last Updated */}
              <div className="bg-white rounded-lg p-4 sm:p-5 border border-neutral-200 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    className="w-5 h-5 text-neutral-600"
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
                  <p className="text-xs sm:text-sm text-neutral-600 uppercase tracking-wider font-semibold">
                    Last Updated
                  </p>
                </div>
                <p className="text-neutral-900 text-base sm:text-lg font-semibold">
                  {updatedDateText}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={handleAddToWishList}
                disabled={isAdding}
                className="flex-1 bg-black hover:opacity-90 active:scale-95 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-black text-sm sm:text-base"
              >
                {isAdding ? "Adding..." : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <div className="bg-white border border-neutral-200 rounded-lg sm:rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6">
              Reviews
            </h2>

            {!token && (
              <p className="text-neutral-600 mb-6 text-sm sm:text-base">
                Login terlebih dahulu untuk menambahkan review.
              </p>
            )}

            {token && (
              <form
                onSubmit={handleAddReview}
                className="mb-8 p-4 sm:p-6 bg-neutral-50 border border-neutral-200 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-neutral-700 mb-2 font-semibold">
                      Rating
                    </label>
                    <select
                      value={rating}
                      onChange={(event) =>
                        setRating(Number(event.target.value))
                      }
                      className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs sm:text-sm text-neutral-700 mb-2 font-semibold">
                      Comment
                    </label>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2 h-24 text-xs sm:text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                      placeholder="Tulis review kamu..."
                      maxLength={500}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isAddingReview}
                  className="mt-4 bg-black hover:opacity-90 active:scale-95 text-white font-semibold px-6 py-2.5 sm:py-3 rounded-lg shadow-md disabled:opacity-50 text-xs sm:text-sm border border-black"
                >
                  {isAddingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {reviewsLoading && (
              <p className="text-neutral-500">Loading reviews...</p>
            )}

            {reviewsError && (
              <p className="text-red-600">Gagal memuat review.</p>
            )}

            {!reviewsLoading && !reviewsError && (
              <div className="space-y-4">
                {reviewsData?.data?.length === 0 && (
                  <p className="text-neutral-500">Belum ada review.</p>
                )}

                {reviewsData?.data?.map((review) => (
                  <div
                    key={review.id}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-neutral-900 font-semibold">
                          {review.user?.name || review.user?.email || "User"}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-yellow-400 font-semibold">
                        {review.rating} / 5
                      </div>
                    </div>

                    {editingReviewId === review.id ? (
                      <form onSubmit={handleUpdateReview} className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm text-neutral-700 mb-2 font-semibold">
                              Rating
                            </label>
                            <select
                              value={editingRating}
                              onChange={(event) =>
                                setEditingRating(Number(event.target.value))
                              }
                              className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                            >
                              {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm text-neutral-700 mb-2 font-semibold">
                              Comment
                            </label>
                            <textarea
                              value={editingComment}
                              onChange={(event) =>
                                setEditingComment(event.target.value)
                              }
                              className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg px-3 py-2 h-24 text-xs sm:text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                              maxLength={500}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button
                            type="submit"
                            disabled={
                              isUpdatingReview ||
                              processingReviewId === editingReviewId
                            }
                            className="bg-black hover:opacity-90 active:scale-95 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 text-xs sm:text-sm border border-black"
                          >
                            {isUpdatingReview ||
                            processingReviewId === editingReviewId
                              ? "Saving..."
                              : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={
                              isUpdatingReview ||
                              processingReviewId === editingReviewId
                            }
                            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-semibold px-4 py-2 rounded-lg disabled:opacity-50 text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-neutral-700 text-sm sm:text-base mt-3">
                        {review.comment}
                      </p>
                    )}

                    {review.userId === meId &&
                      editingReviewId !== review.id && (
                        <div className="flex gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(review)}
                            disabled={
                              isDeletingReview ||
                              processingReviewId === review.id
                            }
                            className="text-neutral-700 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={
                              isDeletingReview ||
                              processingReviewId === review.id
                            }
                            className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingReviewId === review.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
