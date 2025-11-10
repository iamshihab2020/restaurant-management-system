import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { findUserByEmail } from "@/lib/mock-data/users";

/**
 * Authentication store state interface
 */
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Zustand store for authentication state
 * Uses persist middleware to save auth state to localStorage
 *
 * NOTE: This is using mock authentication for development.
 * In production, this will call actual API endpoints with JWT tokens.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Mock login function
       * Accepts any password for demo purposes
       * In production, this will call POST /api/auth/login
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Find user in mock data
          const user = findUserByEmail(email);

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Mock password validation (accept any password for demo)
          // In production: validate against hashed password from API
          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error("Account is inactive. Please contact administrator.");
          }

          // Set authenticated user
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },

      /**
       * Logout function
       * Clears user state and removes from localStorage
       * In production, this will also call POST /api/auth/logout
       */
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
