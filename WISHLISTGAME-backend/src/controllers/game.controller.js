import prisma from "../config/db.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getAllGames = asyncHandler(async (req, res) => {
  // Get pagination parameters from query string with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get total count for pagination metadata
  const totalGames = await prisma.game.count();

  // Get paginated games
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      genre: true,
      releaseDate: true,
      urlPicture: true,
    },
    skip: skip,
    take: limit,
  });

  res.status(200).json({
    success: true,
    data: games,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalGames / limit),
      totalGames: totalGames,
      limit: limit,
    },
  });
});

export const getGameById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const game = await prisma.game.findUnique({
    where: { id: id },
  });
  if (!game) {
    return res.status(404).json({
      success: false,
      message: "Game not found",
    });
  }
  res.status(200).json({
    success: true,
    data: game,
  });
});
