import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "main",
      unique: true,
      immutable: true,
      select: false,
    },

    name: {
      type: String,
      default: "",
    },

    headline: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: [
      {
        role: String,
        company: String,
        duration: String,
        description: String,
      },
    ],

    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
