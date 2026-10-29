
import express from "express";

import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProjects);
router.get("/:id", getProject);

// Protected admin routes
router.post("/", protect, createProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
