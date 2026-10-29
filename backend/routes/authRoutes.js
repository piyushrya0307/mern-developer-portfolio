import express from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  logoutAdmin,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes",
  },
});

// Limit password change attempts
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password attempts. Try again later.",
  },
});

// Public
router.post("/login", loginLimiter, login);

// Protected: Admin only
router.post("/logout", protect, logoutAdmin);
router.get("/me", protect, getMe);

// Admin Settings
router.patch("/profile", protect, updateProfile);
router.patch("/password", protect, passwordLimiter, changePassword);

export default router;
