import Content from "../models/contentModel.js";

const CONTENT_KEY = "main";

// Only these fields can be edited
const allowedFields = [
  "name",
  "headline",
  "about",
  "profileImage",
  "resumeUrl",
  "email",
  "location",
  "skills",
  "experience",
  "socialLinks",
];

// Check HTTP/HTTPS URLs
const validUrl = (value) => {
  if (value === "") return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

// Validate submitted content
const validateContent = (data) => {
  const textLimits = {
    name: 100,
    headline: 200,
    about: 5000,
    profileImage: 2048,
    resumeUrl: 2048,
    email: 254,
    location: 150,
  };

  for (const [field, limit] of Object.entries(textLimits)) {
    if (data[field] === undefined) continue;

    if (typeof data[field] !== "string" || data[field].length > limit) {
      return `Invalid ${field}`;
    }
  }

  for (const field of ["profileImage", "resumeUrl"]) {
    if (data[field] !== undefined && !validUrl(data[field])) {
      return `Invalid ${field} URL`;
    }
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return "Invalid email address";
  }

  if (data.skills !== undefined) {
    if (
      !Array.isArray(data.skills) ||
      data.skills.length > 50 ||
      !data.skills.every(
        (skill) =>
          typeof skill === "string" && skill.length > 0 && skill.length <= 60,
      )
    ) {
      return "Invalid skills array";
    }
  }

  if (data.experience !== undefined) {
    if (!Array.isArray(data.experience) || data.experience.length > 30) {
      return "Invalid experience array";
    }

    const limits = {
      role: 150,
      company: 150,
      duration: 100,
      description: 2000,
    };

    for (const exp of data.experience) {
      if (!exp || typeof exp !== "object" || Array.isArray(exp)) {
        return "Invalid experience entry";
      }

      for (const [key, value] of Object.entries(exp)) {
        if (
          !(key in limits) ||
          typeof value !== "string" ||
          value.length > limits[key]
        ) {
          return "Invalid experience entry";
        }
      }
    }
  }

  if (data.socialLinks !== undefined) {
    const links = data.socialLinks;

    if (!links || typeof links !== "object" || Array.isArray(links)) {
      return "Invalid social links";
    }

    for (const [key, value] of Object.entries(links)) {
      if (
        !["github", "linkedin", "instagram"].includes(key) ||
        typeof value !== "string" ||
        value.length > 2048 ||
        !validUrl(value)
      ) {
        return "Invalid social link";
      }
    }
  }

  return null;
};

// GET /api/content
export const getContent = async (req, res) => {
  try {
    const content = await Content.findOne({
      singletonKey: CONTENT_KEY,
    });

    return res.status(200).json({
      success: true,
      content: content || null,
    });
  } catch (error) {
    console.error("Get content error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/content
export const updateContent = async (req, res) => {
  try {
    const body = req.body || {};

    // Don't allow unknown fields
    const unknownFields = Object.keys(body).filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length) {
      return res.status(400).json({
        success: false,
        message: "Unknown content fields",
      });
    }

    // Build a safe update object
    const data = Object.fromEntries(
      allowedFields
        .filter((field) => body[field] !== undefined)
        .map((field) => [field, body[field]]),
    );

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No content provided",
      });
    }

    const error = validateContent(data);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // Sanitize experience fields
    if (data.experience) {
      data.experience = data.experience.map((exp) => ({
        role: exp.role || "",
        company: exp.company || "",
        duration: exp.duration || "",
        description: exp.description || "",
      }));
    }

    // Sanitize social links
    if (data.socialLinks) {
      const links = data.socialLinks;

      const safeLinks = {};

      for (const key of ["github", "linkedin", "instagram"]) {
        if (links[key] !== undefined) {
          safeLinks[key] = links[key];
        }
      }

      data.socialLinks = safeLinks;
    }

    const content = await Content.findOneAndUpdate(
      { singletonKey: CONTENT_KEY },
      { $set: data, $setOnInsert: { singletonKey: CONTENT_KEY } },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Portfolio content updated successfully",
      content,
    });
  } catch (error) {
    console.error("Update content error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
