
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dns from "node:dns";

import connectDb from "../config/db.js";
import Admin from "../models/adminModel.js";

dns.setServers(["1.1.1.1"]);

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error("Admin credentials missing in .env");
    }

    if (password.length < 8) {
      throw new Error("Admin password must be at least 8 characters");
    }

    await connectDb();

    const existingAdmin = await Admin.findOne({});

    if (existingAdmin) {
      console.log("An admin already exists. No new admin created.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Admin setup error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
