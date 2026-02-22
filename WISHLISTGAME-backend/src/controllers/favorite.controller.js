import prisma from "../config/db.js";
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

const attachGames = async (favorites) => {
  const gameMap = await buildGameMap(favorites.map((fav) => fav.gameId));
  return favorites.map((fav) => ({
    ...fav,
    game: gameMap.get(fav.gameId) || null,
  }));
};

export const getFavorites = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  const data = await attachGames(favorites);
  res.status(200).json({
    success: true,
    data,
  });
});

export const updateFavorites = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { gameIds } = req.body;

  if (!Array.isArray(gameIds)) {
    return res.status(400).json({
      success: false,
      message: "gameIds must be an array",
    });
  }

  const normalized = Array.from(
    new Set(
      gameIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );

  if (normalized.length > 4) {
    return res.status(400).json({
      success: false,
      message: "You can only select up to 4 favorites",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.favorite.deleteMany({ where: { userId } });
    if (normalized.length > 0) {
      await tx.favorite.createMany({
        data: normalized.map((gameId) => ({ userId, gameId })),
      });
    }
  });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  const data = await attachGames(favorites);

  res.status(200).json({
    success: true,
    data,
    message: "Favorites updated successfully",
  });
});
