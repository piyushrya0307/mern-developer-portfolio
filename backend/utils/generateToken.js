import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// Generate JWT with admin ID and token version
export const generateToken = (adminId, tokenVersion = 0) => {
  return jwt.sign(
    {
      id: adminId.toString(),
      tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

// Store JWT securely in HTTP-only cookie
export const setTokenCookie = (res, token) => {
  res.cookie("adminToken", token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// Clear authentication cookie
export const clearTokenCookie = (res) => {
  res.clearCookie("adminToken", cookieOptions);
};
