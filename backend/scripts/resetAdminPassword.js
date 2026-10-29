
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dns from "node:dns";

import connectDb from "../config/db.js";
import Admin from "../models/adminModel.js";

// Same DNS configuration used for MongoDB connection
dns.setServers(["1.1.1.1"]);

const resetPassword = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || password.length < 8) {
      throw new Error("Valid email and 8+ character password required");
    }

    await connectDb();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new Error("Admin account not found");
    }

    admin.password = await bcrypt.hash(password, 12);
    await admin.save();

    console.log("Admin password reset successfully!");
  } catch (error) {
    console.error("Reset error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

resetPassword();
