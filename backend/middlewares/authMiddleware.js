import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login!",
      });
    }

    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded.id || !Number.isInteger(decoded.tokenVersion ?? 0)) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    // Load admin with current token version
    const admin = await Admin.findById(decoded.id).select(
      "name email tokenVersion",
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found!",
      });
    }

    const currentVersion = admin.tokenVersion ?? 0;
    const sessionVersion = decoded.tokenVersion ?? 0;

    // Revoke JWTs issued before password change
    if (sessionVersion !== currentVersion) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // Attach authenticated admin details to request
    req.admin = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default protect;
