import { ok } from "../utils/response.js";

export const getReceiptUploadUrl = async (_req, res) => {
  return ok(res, {
    uploadUrl: "https://example-presigned-url",
    expiresInSeconds: 900
  });
};
