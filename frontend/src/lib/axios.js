import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
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
