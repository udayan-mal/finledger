import { fail } from "../utils/response.js";

export const validate = (schema, source = "body") => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    return fail(res, parsed.error.issues.map((i) => i.message).join(", "), 422, "VALIDATION_ERROR");
  }
  req[source] = parsed.data;
  return next();
};
