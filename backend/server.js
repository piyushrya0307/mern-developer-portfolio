import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL is missing");
}

const CLIENT_ORIGIN = new URL(process.env.CLIENT_URL).origin;

// Hide Express fingerprint
app.disable("x-powered-by");

// Security headers
app.use(helmet());

// Allow only configured frontend origin

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.NODE_ENV !== "production"
    ? [process.env.CLIENT_PREVIEW_URL]
    : []),
]
  .filter(Boolean)
  .map((url) => new URL(url).origin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

// Keep this after CORS and before API routes
app.use((req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const origin = req.get("Origin");
  const referer = req.get("Referer");

  let requestOrigin = origin;

  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).origin;
    } catch {
      return res.status(403).json({
        success: false,
        message: "Invalid request origin",
      });
    }
  }

  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  next();
});

// Body parser
app.use(express.json({ limit: "10kb" }));

// Parse HTTP-only authentication cookies
app.use(cookieParser());

// Origin verification for state-changing requests
const writeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

app.use((req, res, next) => {
  if (!writeMethods.has(req.method)) {
    return next();
  }

  const origin = req.get("Origin");
  const referer = req.get("Referer");

  let sourceOrigin = origin;

  // Some legitimate requests may omit Origin.
  // Try Referer as a fallback.
  if (!sourceOrigin && referer) {
    try {
      sourceOrigin = new URL(referer).origin;
    } catch {
      return res.status(403).json({
        success: false,
        message: "Invalid request origin",
      });
    }
  }

  if (sourceOrigin !== CLIENT_ORIGIN) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
  }

  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Portfolio API is running",
  });
});

// Unknown API endpoints
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Express error:", err.message);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
  }

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
};

startServer();
