import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { refreshAccessToken } from "@/shared/api/token-refresh";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const newAccess = await refreshAccessToken();

    if (!newAccess) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
    return apiClient(originalRequest);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      error?: { message?: string };
      message?: string;
      detail?: string;
    };
    return (
      data?.error?.message ||
      data?.message ||
      data?.detail ||
      error.message ||
      "An error occurred."
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}
