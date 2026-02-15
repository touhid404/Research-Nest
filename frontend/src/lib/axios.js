import axios from "axios";
import { auth } from "../firebase/firebase.init";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Public axios instance (no auth required) - for register, google login, public reviews
export const axiosPublic = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

// Private axios instance (auth required) - for all authenticated requests
export const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
