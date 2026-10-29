
import mongoose from "mongoose";
import Project from "../models/projectModel.js";

// Basic project input validation
const validateProject = (data) => {
  const {
    title,
    description,
    technologies,
    image,
    githubUrl,
    liveUrl,
    featured,
    order,
  } = data;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    return "Title and description are required";
  }

  if (title.length > 150 || description.length > 5000) {
    return "Title or description is too long";
  }

  if (
    technologies !== undefined &&
    (!Array.isArray(technologies) ||
      technologies.length > 30 ||
      !technologies.every(
        (tech) => typeof tech === "string" && tech.length <= 50
      ))
  ) {
    return "Invalid technologies array";
  }

  for (const field of ["image", "githubUrl", "liveUrl"]) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" ||
        data[field].length > 2048)
    ) {
      return `Invalid ${field}`;
    }

    if (data[field]) {
      try {
        const url = new URL(data[field]);
        if (!["http:", "https:"].includes(url.protocol)) {
          return `Invalid ${field} URL`;
        }
      } catch {
        return `Invalid ${field} URL`;
      }
    }
  }

  if (featured !== undefined && typeof featured !== "boolean") {
    return "Featured must be true or false";
  }

  if (
    order !== undefined &&
    (!Number.isInteger(order) || order < 0)
  ) {
    return "Order must be a non-negative integer";
  }

  return null;
};

const allowedFields = [
  "title",
  "description",
  "image",
  "technologies",
  "githubUrl",
  "liveUrl",
  "featured",
  "order",
];

const pickProjectFields = (body) =>
  Object.fromEntries(
    allowedFields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  );

// GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/projects/:id
export const getProject = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/projects
export const createProject = async (req, res) => {
  try {
    const data = pickProjectFields(req.body || {});

    const validationError = validateProject(data);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const project = await Project.create(data);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/projects/:id
export const updateProject = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const data = pickProjectFields(req.body || {});

    if (!Object.keys(data).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // Validate submitted fields
    const validationError = validateProject({
      title: data.title ?? "placeholder",
      description: data.description ?? "placeholder",
      ...data,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
