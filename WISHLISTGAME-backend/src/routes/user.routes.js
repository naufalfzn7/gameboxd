import { Router } from "express";
import {
  authentication,
  authorizeRoles,
} from "../middlewares/authorization.js";
import {
  deleteUserById,
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateCurrentUser,
  updateUserAsAdmin,
} from "../controllers/user.controller.js";

const router = Router();

// Example route
router.get("/all", authentication, getAllUsers);
router.get("/me", authentication, getCurrentUser);
router.get("/:id", authentication, getUserById);
router.put("/me", authentication, updateCurrentUser);
router.put("/admin/:id", authentication, updateUserAsAdmin);
router.delete("/:id", authentication, authorizeRoles("ADMIN"), deleteUserById);

export default router;
