import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true
});

// Intercept requests and attach the JWT token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle global 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we receive a 401 Unauthorized and we're not already on the login page...
    if (error.response?.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
       // Typically we would try to refresh token here, but for MVP we bounce to login.
       localStorage.removeItem("accessToken");
       localStorage.removeItem("user");
       window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchDashboardSummary = async () => {
  const { data } = await api.get("/dashboard/summary");
  return data;
};
