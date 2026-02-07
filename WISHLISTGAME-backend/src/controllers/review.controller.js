import prisma from "../config/db.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    include: {
      user: true,
      game: true,
    },
  });
  if (reviews.length === 0 || !reviews) {
    const error = new Error("No reviews found");
    error.status = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

export const getReviewByGameId = asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const reviews = await prisma.review.findMany({
    where: { gameId: gameId },
    include: {
      user: true,
      game: true,
    },
    orderBy: { createdAt: "desc" },
  });
  if (reviews.length === 0 || !reviews) {
    const error = new Error("No reviews found for this game");
    error.status = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

export const getReviewByUserId = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reviews = await prisma.review.findMany({
    where: { userId: userId },
    include: {
      user: true,
      game: true,
    },
  });
  if (reviews.length === 0 || !reviews) {
    const error = new Error("No reviews found for this user");
    error.status = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { gameId, rating, comment } = req.body;
  const newReview = await prisma.review.create({
    data: {
      userId: userId,
      gameId: gameId,
      rating,
      comment,
    },
  });
  if (!newReview) {
    const error = new Error("Failed to add review");
    error.status = 500;
    throw error;
  }
  io.emit("newReview", newReview);
  res.status(201).json({
    success: true,
    data: newReview,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const userId = req.user.id;
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    const error = new Error("Review not found");
    error.status = 404;
    throw error;
  }
  if (review.userId !== userId) {
    const error = new Error("Unauthorized to delete this review");
    error.status = 403;
    throw error;
  }
  await prisma.review.delete({
    where: { id: reviewId },
  });
  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const userId = req.user.id;
  const { rating, comment } = req.body;
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    const error = new Error("Review not found");
    error.status = 404;
    throw error;
  }
  if (review.userId !== userId) {
    const error = new Error("Unauthorized to update this review");
    error.status = 403;
    throw error;
  }
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      comment,
    },
  });
  res.status(200).json({
    success: true,
    data: updatedReview,
  });
});

export const getReviewByReviewId = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: true,
      game: true,
    },
  });
  if (!review) {
    const error = new Error("Review not found");
    error.status = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: review,
  });
});
