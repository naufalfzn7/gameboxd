import { Router } from "express";
import {
  activateAccount,
  changeEmail,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";

const router = Router();

// Example route
router.post("/register", register);
router.post("/login", login);
router.get("/activate/:id", activateAccount);
router.get("/changeEmail/:id", changeEmail);
router.post("/logout", logout);

export default router;
