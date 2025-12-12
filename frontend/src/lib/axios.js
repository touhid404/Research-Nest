import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const axiosInstance = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

// Add request interceptor to include user ID
axiosInstance.interceptors.request.use(
  (config) => {
    // Get user ID from localStorage
    const uid = localStorage.getItem("uid");

    if (uid) {
      config.headers["x-user-id"] = uid;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
