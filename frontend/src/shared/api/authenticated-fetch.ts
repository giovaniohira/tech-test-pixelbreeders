import { API_URL } from "@/shared/constants";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { refreshAccessToken } from "@/shared/api/token-refresh";

async function fetchWithToken(url: string, accessToken: string): Promise<Response> {
  return fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function fetchAuthenticatedBlob(path: string): Promise<Blob> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("Not authenticated.");
  }

  let response = await fetchWithToken(url, token);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error("Session expired. Please sign in again.");
    }
    response = await fetchWithToken(url, newToken);
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return response.blob();
}
