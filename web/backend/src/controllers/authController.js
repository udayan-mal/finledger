import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { ok, fail } from "../utils/response.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const buildAuthResponse = (user) => {
  const payload = { sub: user.id, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      currencyPreference: user.currencyPreference,
      timezone: user.timezone
    }
  };
};

export const register = async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (existing) {
      return fail(res, "Email already registered", 409, "ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        passwordHash,
        currencyPreference: req.body.currencyPreference,
        timezone: req.body.timezone
      }
    });

    const auth = buildAuthResponse(user);
    res.cookie("refreshToken", auth.refreshToken, { httpOnly: true, sameSite: "lax", secure: false });
    return ok(res, { accessToken: auth.accessToken, user: auth.user }, 201);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user) {
      return fail(res, "Invalid credentials", 401, "UNAUTHORIZED");
    }

    const valid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) {
      return fail(res, "Invalid credentials", 401, "UNAUTHORIZED");
    }

    const auth = buildAuthResponse(user);
    res.cookie("refreshToken", auth.refreshToken, { httpOnly: true, sameSite: "lax", secure: false });
    return ok(res, { accessToken: auth.accessToken, user: auth.user });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return fail(res, "Missing refresh token", 401, "UNAUTHORIZED");
  }

  try {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ sub: payload.sub, email: payload.email });
    return ok(res, { accessToken });
  } catch {
    return fail(res, "Invalid refresh token", 401, "UNAUTHORIZED");
  }
};
