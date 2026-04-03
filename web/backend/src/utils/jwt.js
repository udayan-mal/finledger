import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (payload) => jwt.sign(payload, env.accessSecret, { expiresIn: env.accessTtl });

export const signRefreshToken = (payload) => jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshTtl });

export const verifyAccessToken = (token) => jwt.verify(token, env.accessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.refreshSecret);
