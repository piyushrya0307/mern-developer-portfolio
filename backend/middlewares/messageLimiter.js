
import rateLimit from "express-rate-limit";

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many messages. Try again in 15 minutes.",
  },
});

export default messageLimiter;
