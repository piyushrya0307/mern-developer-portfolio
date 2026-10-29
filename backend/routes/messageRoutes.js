import express from "express";

import {
  createMessage,
  getMessages,
  getMessage,
  getMessageStats,
  markAsRead,
  setMessageImportance,
  deleteMessage,
  replyToMessage,
} from "../controllers/messageController.js";

import protect from "../middlewares/authMiddleware.js";
import messageLimiter from "../middlewares/messageLimiter.js";

const router = express.Router();

// Public contact form
router.post("/", messageLimiter, createMessage);

// Admin statistics
router.get("/stats", protect, getMessageStats);

// Admin inbox
router.get("/", protect, getMessages);
router.get("/:id", protect, getMessage);

// Message actions
router.patch("/:id/read", protect, markAsRead);

router.patch("/:id/important", protect, setMessageImportance);

// Admin reply to message
router.post("/:id/reply", protect, replyToMessage);

router.delete("/:id", protect, deleteMessage);

export default router;
