import { Router } from "express";
import { authentication } from "../middlewares/authorization.js";
import {
  getFavorites,
  updateFavorites,
} from "../controllers/favorite.controller.js";

const router = Router();

router.get("/", authentication, getFavorites);
router.put("/", authentication, updateFavorites);

export default router;
