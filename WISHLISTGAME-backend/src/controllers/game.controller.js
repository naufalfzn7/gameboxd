import asyncHandler from "../middlewares/asyncHandler.js";
import {
  fetchRawgGameById,
  fetchRawgGames,
  mapRawgGameToDetail,
  mapRawgGameToSummary,
} from "../services/rawgApi.js";
import { prisma } from "../config/db.js";

export const getAllGames = asyncHandler(async (req, res) => {
  // Get pagination parameters from query string with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || undefined;

  const rawgResponse = await fetchRawgGames({
    page,
    pageSize: limit,
    search,
  });

  const games = (rawgResponse.results || []).map(mapRawgGameToSummary);
  const totalGames = rawgResponse.count || 0;

  res.status(200).json({
    success: true,
    data: games,
    pagination: {
      currentPage: page,
      totalPages: totalGames ? Math.ceil(totalGames / limit) : 0,
      totalGames: totalGames,
      limit: limit,
    },
  });
});

export const getGameById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gameId = Number(id);
  if (!Number.isInteger(gameId) || gameId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid game ID",
    });
  }
  
  // Fetch game details from RAWG
  const rawgGame = await fetchRawgGameById(gameId);
  const game = mapRawgGameToDetail(rawgGame);
  
  // Calculate average rating from user reviews in database
  const reviews = await prisma.review.findMany({
    where: { gameId: gameId },
    select: { rating: true },
  });
  
  // Calculate user rating (override RAWG rating with user reviews)
  let userRating = 0;
  let reviewCount = 0;
  
  if (reviews && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    userRating = totalRating / reviews.length;
    reviewCount = reviews.length;
  }
  
  // Override rating with user-generated rating
  game.rating = userRating;
  game.reviewCount = reviewCount;
  game.rawgRating = rawgGame.rating; // Keep original RAWG rating for reference
  
  res.status(200).json({
    success: true,
    data: game,
  });
});
