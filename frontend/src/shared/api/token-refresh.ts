import axios from "axios";
import { API_URL } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store/auth-store";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh/`,
      {},
      { withCredentials: true },
    );

    const newAccess = response.data.data.tokens.access as string;
    useAuthStore.getState().setTokens(newAccess);

    processQueue(null, newAccess);
    return newAccess;
  } catch (error) {
    processQueue(error, null);
    useAuthStore.getState().logout();
    return null;
  } finally {
    isRefreshing = false;
  }
}
