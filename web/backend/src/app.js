import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(apiRateLimit);

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" }, error: null, code: 200 });
});

app.use("/api/v1", routes);
app.use(notFound);
app.use(errorHandler);
