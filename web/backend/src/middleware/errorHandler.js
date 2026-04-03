import { fail } from "../utils/response.js";

export const notFound = (_req, res) => fail(res, "Route not found", 404, "NOT_FOUND");

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";
  return fail(res, message, statusCode, "INTERNAL_SERVER_ERROR");
};
