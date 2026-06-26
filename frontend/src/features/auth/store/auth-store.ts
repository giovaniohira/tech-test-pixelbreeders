import { create } from "zustand";
import type { User } from "@/shared/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  setAuth: (user: User, access: string) => void;
  setTokens: (access: string) => void;
  setUser: (user: User) => void;
  setBootstrapped: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isBootstrapped: false,
  setAuth: (user, access) =>
    set({
      user,
      accessToken: access,
      isAuthenticated: true,
    }),
  setTokens: (access) =>
    set({
      accessToken: access,
      isAuthenticated: true,
    }),
  setUser: (user) => set({ user }),
  setBootstrapped: (value) => set({ isBootstrapped: value }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),
}));
