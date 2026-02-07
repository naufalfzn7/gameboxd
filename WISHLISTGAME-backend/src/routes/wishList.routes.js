import { Router } from "express";
import {
  addToWishList,
  getDetailWishListById,
  getWishList,
  removeFromWishListById,
  updateWishListById,
} from "../controllers/wishList.controller.js";
import { authentication } from "../middlewares/authorization.js";

const router = Router();

router.get("/", authentication, getWishList);
router.get("/:wishListId", authentication, getDetailWishListById);
router.post("/:gameId", authentication, addToWishList);
router.delete("/:wishListId", authentication, removeFromWishListById);
router.put("/:wishListId", authentication, updateWishListById);

export default router;
