import { prisma } from "../config/db.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  fetchRawgGameById,
  mapRawgGameToSummary,
} from "../services/rawgApi.js";

export const getWishList = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const wishListEntries = await prisma.wishlist.findMany({
    where: {
      userId: id,
    },
  });
  if (wishListEntries.length === 0) {
    const error = new Error("Wishlist is empty");
    error.status = 404;
    throw error;
  }
  const games = await Promise.all(
    wishListEntries.map(async (entry) => {
      try {
        const rawgGame = await fetchRawgGameById(entry.gameId);
        return mapRawgGameToSummary(rawgGame);
      } catch (fetchError) {
        return null;
      }
    }),
  );
  const data = wishListEntries.map((entry, index) => ({
    ...entry,
    game: games[index],
  }));
  res.status(200).json({
    success: true,
    data,
  });
});

export const getDetailWishListById = asyncHandler(async (req, res) => {
  const { wishListId } = req.params;
  const wishListEntry = await prisma.wishlist.findUnique({
    where: {
      id: wishListId,
    },
  });
  if (!wishListEntry) {
    const error = new Error("Wishlist entry not found");
    error.status = 404;
    throw error;
  }
  let game = null;
  try {
    const rawgGame = await fetchRawgGameById(wishListEntry.gameId);
    game = mapRawgGameToSummary(rawgGame);
  } catch (fetchError) {
    game = null;
  }
  res.status(200).json({
    success: true,
    data: {
      ...wishListEntry,
      game,
    },
  });
});

export const addToWishList = asyncHandler(async (req, res) => {
  const { id } = req.user;
  console.log(id);

  const { gameId } = req.params;
  const parsedGameId = Number(gameId);
  if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
    const error = new Error("Game ID is required");
    error.status = 400;
    throw error;
  }
  const existingEntry = await prisma.wishlist.findFirst({
    where: {
      userId: id,
      gameId: parsedGameId,
    },
  });
  if (existingEntry) {
    const error = new Error("Game already in wishlist");
    error.status = 400;
    throw error;
  }
  const newWishListEntry = await prisma.wishlist.create({
    data: {
      userId: id,
      gameId: parsedGameId,
    },
  });
  res.status(201).json({
    success: true,
    data: newWishListEntry,
    message: "Game added to wishlist successfully",
  });
});

export const removeFromWishListById = asyncHandler(async (req, res) => {
  const { wishListId } = req.params;
  const existingEntry = await prisma.wishlist.findUnique({
    where: {
      id: wishListId,
    },
  });
  if (!existingEntry) {
    const error = new Error("Wishlist entry not found");
    error.status = 404;
    throw error;
  }
  await prisma.wishlist.delete({
    where: {
      id: wishListId,
    },
  });
  res.status(200).json({
    success: true,
    message: "Game removed from wishlist successfully",
  });
});

export const updateWishListById = asyncHandler(async (req, res) => {
  const { wishListId } = req.params;
  const { id: userId } = req.user;
  const status = req.body.status;

  const existingEntry = await prisma.wishlist.findUnique({
    where: {
      id: wishListId,
    },
  });
  if (!existingEntry) {
    const error = new Error("Wishlist entry not found");
    error.status = 404;
    throw error;
  }
  if (existingEntry.userId !== userId) {
    const error = new Error("Unauthorized to update this wishlist entry");
    error.status = 403;
    throw error;
  }
  const updatedEntry = await prisma.wishlist.update({
    where: {
      id: wishListId,
    },
    data: {
      status: status,
    },
  });
  res.status(200).json({
    success: true,
    data: updatedEntry,
    message: "Wishlist entry updated successfully",
  });
});
