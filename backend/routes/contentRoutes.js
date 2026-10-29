
import express from "express";

import {
  getContent,
  updateContent,
} from "../controllers/contentController.js";

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public - Anyone can view portfolio content
router.get("/", getContent);

// Private - Only admin can update content
router.put("/", protect, updateContent);

export default router;
