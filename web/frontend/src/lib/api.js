import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true
});

export const fetchDashboardSummary = async () => {
  const { data } = await api.get("/dashboard/summary");
  return data;
};
