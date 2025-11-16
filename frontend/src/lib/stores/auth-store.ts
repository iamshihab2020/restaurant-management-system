import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Authentication store state interface
 */
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsOnboarding: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Zustand store for authentication state
 * Connects to NestJS backend API
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      needsOnboarding: false,
      _hasHydrated: false,

      /**
       * Login function - attempts both tenant and staff login
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Try tenant login first
          let response = await fetch(`${API_URL}/tenants/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          let data = await response.json();

          // If tenant login fails, try staff login
          if (!response.ok) {
            response = await fetch(`${API_URL}/auth/staff/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            });

            data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || "Invalid email or password");
            }
          }

          // Extract user data (tenant or staff user)
          const userData = data.tenant || data.user;

          // Set authenticated state
          set({
            user: {
              id: userData.id || userData._id,
              name: userData.ownerName || userData.name,
              email: userData.ownerEmail || userData.email,
              role: userData.role || "admin",
              isActive: true,
            },
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            needsOnboarding: data.needsOnboarding || false,
          });
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
            needsOnboarding: false,
          });
          throw error;
        }
      },

      /**
       * Logout function
       */
      logout: () => {
        // TODO: Call backend logout endpoint
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          needsOnboarding: false,
        });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set hydration state
       */
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        needsOnboarding: state.needsOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        // Set hydrated flag when rehydration completes
        state?.setHasHydrated(true);
      },
    }
  )
);
