import { prisma } from "../config/db.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  fetchRawgGameById,
  mapRawgGameToSummary,
} from "../services/rawgApi.js";

const buildGameMap = async (gameIds) => {
  const uniqueIds = Array.from(new Set(gameIds));
  const pairs = await Promise.all(
    uniqueIds.map(async (gameId) => {
      try {
        const rawgGame = await fetchRawgGameById(gameId);
        return [gameId, mapRawgGameToSummary(rawgGame)];
      } catch (fetchError) {
        return [gameId, null];
      }
    }),
  );
  return new Map(pairs);
};

export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    include: {
      user: true,
    },
  });
  const gameMap = await buildGameMap(reviews.map((review) => review.gameId));
  const data = reviews.map((review) => ({
    ...review,
    game: gameMap.get(review.gameId) || null,
  }));
  res.status(200).json({
    success: true,
    data,
  });
});

export const getReviewByGameId = asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const parsedGameId = Number(gameId);
  if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
    const error = new Error("Game ID is required");
    error.status = 400;
    throw error;
  }
  const reviews = await prisma.review.findMany({
    where: { gameId: parsedGameId },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
  let game = null;
  try {
    const rawgGame = await fetchRawgGameById(parsedGameId);
    game = mapRawgGameToSummary(rawgGame);
  } catch (fetchError) {
    game = null;
  }
  res.status(200).json({
    success: true,
    data: reviews,
    game,
  });
});

export const getReviewByUserId = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reviews = await prisma.review.findMany({
    where: { userId: userId },
    include: {
      user: true,
    },
  });
  const gameMap = await buildGameMap(reviews.map((review) => review.gameId));
  const data = reviews.map((review) => ({
    ...review,
    game: gameMap.get(review.gameId) || null,
  }));
  res.status(200).json({
    success: true,
    data,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { gameId, rating, comment } = req.body;
  const parsedGameId = Number(gameId);
  if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
    const error = new Error("Game ID is required");
    error.status = 400;
    throw error;
  }

  const ratingNumber = Number(rating);
  if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    const error = new Error("Rating must be an integer between 1 and 5");
    error.status = 400;
    throw error;
  }

  if (!comment || !comment.trim()) {
    const error = new Error("Comment is required");
    error.status = 400;
    throw error;
  }

  const existingReview = await prisma.review.findFirst({
    where: { userId, gameId: parsedGameId },
  });
  if (existingReview) {
    const error = new Error("You already reviewed this game");
    error.status = 409;
    throw error;
  }

  const newReview = await prisma.review.create({
    data: {
      userId: userId,
      gameId: parsedGameId,
      rating: ratingNumber,
      comment: comment.trim(),
    },
  });
  if (!newReview) {
    const error = new Error("Failed to add review");
    error.status = 500;
    throw error;
  }
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

  const data = {};
  if (rating !== undefined) {
    const ratingNumber = Number(rating);
    if (
      !Number.isInteger(ratingNumber) ||
      ratingNumber < 1 ||
      ratingNumber > 5
    ) {
      const error = new Error("Rating must be an integer between 1 and 5");
      error.status = 400;
      throw error;
    }
    data.rating = ratingNumber;
  }
  if (comment !== undefined) {
    if (!comment || !comment.trim()) {
      const error = new Error("Comment is required");
      error.status = 400;
      throw error;
    }
    data.comment = comment.trim();
  }

  if (Object.keys(data).length === 0) {
    const error = new Error("No valid fields to update");
    error.status = 400;
    throw error;
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data,
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
    },
  });
  if (!review) {
    const error = new Error("Review not found");
    error.status = 404;
    throw error;
  }
  let game = null;
  try {
    const rawgGame = await fetchRawgGameById(review.gameId);
    game = mapRawgGameToSummary(rawgGame);
  } catch (fetchError) {
    game = null;
  }
  res.status(200).json({
    success: true,
    data: {
      ...review,
      game,
    },
  });
});
