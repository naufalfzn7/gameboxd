import asyncHandler from "../middlewares/asyncHandler.js";
import {
  fetchRawgGameById,
  fetchRawgGames,
  mapRawgGameToDetail,
  mapRawgGameToSummary,
} from "../services/rawgApi.js";

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
  const rawgGame = await fetchRawgGameById(gameId);
  const game = mapRawgGameToDetail(rawgGame);
  res.status(200).json({
    success: true,
    data: game,
  });
});
