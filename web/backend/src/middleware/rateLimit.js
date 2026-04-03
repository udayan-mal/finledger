import rateLimit from "express-rate-limit";

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: "Too many requests", code: "RATE_LIMITED" }
});
