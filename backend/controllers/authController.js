import bcrypt from "bcrypt";
import Admin from "../models/adminModel.js";

import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../utils/generateToken.js";

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    const validPassword = admin
      ? await bcrypt.compare(password, admin.password)
      : false;

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Token version will invalidate old sessions
    // after password changes.
    const token = generateToken(admin._id, admin.tokenVersion ?? 0);

    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/auth/logout
export const logoutAdmin = (req, res) => {
  clearTokenCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  });
};

// PATCH /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body || {};

    if (typeof name !== "string" || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 100 characters",
      });
    }

    if (cleanEmail.length > 254 || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    // req.admin is set by auth middleware
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.name = cleanName;
    admin.email = cleanEmail;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email address already in use",
      });
    }

    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PATCH /api/auth/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required",
      });
    }

    if (newPassword.length < 12 || newPassword.length > 72) {
      return res.status(400).json({
        success: false,
        message: "New password must contain 12 to 72 characters",
      });
    }

    if (
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^a-zA-Z0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must include uppercase, lowercase, number and symbol",
      });
    }

    const admin = await Admin.findById(req.admin.id).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const validPassword = await bcrypt.compare(currentPassword, admin.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, admin.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must differ from the current password",
      });
    }

    // bcrypt hashes passwords before storing them.
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and revoke all older JWT versions.
    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: { password: hashedPassword },
        $inc: { tokenVersion: 1 },
      },
    );

    clearTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
