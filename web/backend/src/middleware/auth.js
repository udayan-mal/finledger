import { verifyAccessToken } from "../utils/jwt.js";
import { fail } from "../utils/response.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

  if (!token) {
    return fail(res, "Missing access token", 401, "UNAUTHORIZED");
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch {
    return fail(res, "Invalid or expired token", 401, "UNAUTHORIZED");
  }
};
