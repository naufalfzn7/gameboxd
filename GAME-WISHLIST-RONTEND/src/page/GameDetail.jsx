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
      <LoadingOverlay
        isLoading={true}
        message="Loading game details..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
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

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
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
    <div className="min-h-screen bg-gray-900">
      <LoadingOverlay isLoading={!!loadingMessage} message={loadingMessage} />
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
                src={game.urlPicture || "/images/game.jpg"}
                alt={game.title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Rating Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">User Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(displayRating)
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
                      {displayRating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">/ 5.0</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {game.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.length > 0 ? (
                  genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg border border-gray-700 hover:bg-gray-900 transition-colors"
                    >
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg border border-gray-700">
                    Unknown genre
                  </span>
                )}
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
                {game.description || "No description available."}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Platforms */}
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
                    Platforms
                  </p>
                </div>
                <p className="text-white text-lg font-semibold">
                  {platformNames || "Unknown"}
                </p>
              </div>

              {/* ESRB */}
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
                    ESRB Rating
                  </p>
                </div>
                <p className="text-white text-lg font-semibold">
                  {game?.esrbRating?.name || "Not rated"}
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
                  {releaseDateText}
                </p>
              </div>

              {/* Last Updated */}
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
                    Last Updated
                  </p>
                </div>
                <p className="text-white text-lg font-semibold">
                  {updatedDateText}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={handleAddToWishList}
                disabled={isAdding}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                {isAdding ? "Adding..." : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Reviews</h2>

            {!token && (
              <p className="text-gray-400 mb-6">
                Login terlebih dahulu untuk menambahkan review.
              </p>
            )}

            {token && (
              <form onSubmit={handleAddReview} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Rating
                    </label>
                    <select
                      value={rating}
                      onChange={(event) =>
                        setRating(Number(event.target.value))
                      }
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm text-gray-400 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 h-24"
                      placeholder="Tulis review kamu..."
                      maxLength={500}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isAddingReview}
                  className="mt-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isAddingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {reviewsLoading && (
              <p className="text-gray-400">Loading reviews...</p>
            )}

            {reviewsError && (
              <p className="text-red-400">Gagal memuat review.</p>
            )}

            {!reviewsLoading && !reviewsError && (
              <div className="space-y-4">
                {reviewsData?.data?.length === 0 && (
                  <p className="text-gray-400">Belum ada review.</p>
                )}

                {reviewsData?.data?.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-800/60 border border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold">
                          {review.user?.name || review.user?.email || "User"}
                        </p>
                        <p className="text-sm text-gray-400">
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
                            <label className="block text-sm text-gray-400 mb-2">
                              Rating
                            </label>
                            <select
                              value={editingRating}
                              onChange={(event) =>
                                setEditingRating(Number(event.target.value))
                              }
                              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
                            >
                              {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">
                              Comment
                            </label>
                            <textarea
                              value={editingComment}
                              onChange={(event) =>
                                setEditingComment(event.target.value)
                              }
                              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 h-24"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
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
                            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-gray-300 mt-3">{review.comment}</p>
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
                            className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
