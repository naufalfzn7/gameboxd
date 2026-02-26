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

// GET endpoints are PUBLIC - anyone can view reviews
router.get("/game/:gameId", getReviewByGameId);
router.get("/:id", getReviewByReviewId);

// User-specific and all reviews require authentication
router.get("/", authentication, getAllReviews);
router.get("/me", authentication, getReviewByUserId);

// Modify operations require authentication
router.post("/", authentication, addReview);
router.delete("/:id", authentication, deleteReview);
router.put("/:id", authentication, updateReview);

export default router;
