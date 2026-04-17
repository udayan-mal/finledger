import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true
});

const inMemoryGetCache = new Map();

const buildCacheKey = (url, params) => `${url}::${JSON.stringify(params || {})}`;

const getCachedEntry = (cacheKey) => {
  const entry = inMemoryGetCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    inMemoryGetCache.delete(cacheKey);
    return null;
  }
  return entry.payload;
};

export const clearApiGetCache = () => {
  inMemoryGetCache.clear();
};

export const apiGetCached = async (url, options = {}) => {
  const { ttlMs = 20000, force = false, params, ...config } = options;
  const cacheKey = buildCacheKey(url, params);

  if (!force) {
    const cachedPayload = getCachedEntry(cacheKey);
    if (cachedPayload) return cachedPayload;
  }

  const response = await api.get(url, { ...config, params });
  inMemoryGetCache.set(cacheKey, {
    payload: response,
    expiresAt: Date.now() + ttlMs
  });

  return response;
};

// Intercept requests and attach the JWT token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Mutating requests invalidate cached GET responses so lists stay consistent.
  const method = (config.method || "get").toLowerCase();
  if (method !== "get") {
    clearApiGetCache();
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
