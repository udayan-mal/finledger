import { ok } from "../utils/response.js";
import { getDashboardSummary } from "../services/dashboardService.js";

export const getSummary = async (req, res, next) => {
  try {
    const data = await getDashboardSummary(req.user.sub);
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
};
