import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, updateAuth, clearAuth } from "@/storage/authStorage";


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let isRefreshing = false;
let errorMessage;

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};


export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const data = await getAuth();
    const token = data?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // console.log("USR:", data);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";
    errorMessage = error.response?.data?.errors;

    // 1️⃣ Validation errors (expected)
    if (status === 422) {
      return Promise.reject({
        type: "validation",
        errors: errorMessage,
      });
    }

    // 2️⃣ AUTH ROUTES SHOULD NEVER REFRESH
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/signup") ||
      url.includes("/auth/refresh");

    if (status === 401 && isAuthRoute) {
      return Promise.reject({
        type: "auth",
        message: errorMessage,
      });
    }

    // 3️⃣ Token refresh logic (ONLY for protected routes)
    if (status === 401 && !originalRequest._retry) {
      const data = await getAuth();
      const refreshToken = data?.refreshToken;
      // console.log("THE REFRESH TOKEN",refreshToken)
      if (!refreshToken) {
        await clearAuth();
        return Promise.reject({
          type: "auth",
          message: "Session expired. Please log in again.",
        });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = res.data;

        updateAuth({accessToken: access_token, refreshToken: refresh_token})
        

        api.defaults.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        return Promise.reject({
          type: "auth",
          message: "Session expired. Please log in again.",
        });
      } finally {
        isRefreshing = false;
      }
    }

    // 4️⃣ Fallback server error
    return Promise.reject({
      type: "server",
      message: error.message || "Something went wrong",
      status,
    });
  }
);