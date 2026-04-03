export const ok = (res, data, code = 200) => res.status(code).json({ success: true, data, error: null, code });

export const fail = (res, message, code = 400, errorCode = "BAD_REQUEST") =>
  res.status(code).json({ success: false, data: null, error: message, code: errorCode });
