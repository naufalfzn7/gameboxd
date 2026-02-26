import { Router } from "express";
import { getAllGames, getGameById } from "../controllers/game.controller.js";

const router = Router();

// Game routes are PUBLIC - no authentication required
router.get("/", getAllGames);
router.get("/:id", getGameById);

export default router;
