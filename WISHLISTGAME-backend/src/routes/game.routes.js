import { Router } from "express";
import { authentication } from "../middlewares/authorization.js";
import { getAllGames, getGameById } from "../controllers/game.controller.js";

const router = Router();

router.get("/", authentication, getAllGames);
router.get("/:id", authentication, getGameById);

export default router;
