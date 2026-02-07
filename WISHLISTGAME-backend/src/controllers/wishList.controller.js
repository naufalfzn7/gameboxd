import prisma from "../config/db.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getWishList = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const wishListEntries = await prisma.wishlist.findMany({
    where: {
      userId: id,
    },
    include: {
      game: true,
    },
  });
  if (wishListEntries.length === 0) {
    const error = new Error("Wishlist is empty");
    error.status = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: wishListEntries,
  });
});

export const getDetailWishListById = asyncHandler(async (req, res) => {
  const { wishListId } = req.params;
  const wishListEntry = await prisma.wishlist.findUnique({
    where: {
      id: wishListId,
    },
    include: {
      game: true,
    },
  });
  if (!wishListEntry) {
    const error = new Error("Wishlist entry not found");
    error.status = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: wishListEntry,
  });
});

export const addToWishList = asyncHandler(async (req, res) => {
  const { id } = req.user;
  console.log(id);

  const { gameId } = req.params;
  if (!gameId) {
    const error = new Error("Game ID is required");
    error.status = 400;
    throw error;
  }
  const existingEntry = await prisma.wishlist.findFirst({
    where: {
      userId: id,
      gameId: gameId,
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
      gameId: gameId,
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
