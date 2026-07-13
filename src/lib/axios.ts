import { tokenCache } from "@/utils/cache";
import axios from "axios";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json", "x-platform-os": Platform.OS },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenCache?.getToken("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - logout user");
    }
    let parse = JSON.stringify(error);
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Server error";
    return Promise.reject(new Error(message));
  },
);
