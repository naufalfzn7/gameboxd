import { Router } from "express";
import {
  addReview,
  deleteReview,
  getAllReviews,
  getReviewByGameId,
  getReviewByReviewId,
  getReviewByUserId,
  updateReview,
} from "../controllers/review.controller.js";
import { authentication } from "../middlewares/authorization.js";

const router = Router();

router.get("/", authentication, getAllReviews);
router.get("/me", authentication, getReviewByUserId);
router.get("/game/:gameId", authentication, getReviewByGameId);
router.get("/:id", authentication, getReviewByReviewId);
router.post("/", authentication, addReview);
router.delete("/:id", authentication, deleteReview);
router.put("/:id", authentication, updateReview);

export default router;
