import express from "express";
import {
  changePassword,
  getCurrentUser,
  login,
} from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/change-password", requireAuth, changePassword);

export default router;
