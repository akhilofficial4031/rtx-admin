"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getToken: () => string | null;
}

// Safe localStorage access function
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const initCompleted = useRef(false);

  // Initialize auth state on component mount
  useEffect(() => {
    // Skip if already initialized
    if (initCompleted.current) return;

    // Only run in browser
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const storedUser = safeLocalStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear potentially corrupted data
      safeLocalStorage.removeItem("user");
      safeLocalStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
      initCompleted.current = true;
    }
  }, []);

  // Login function
  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          // Prevent caching
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        // Save token and user data
        safeLocalStorage.setItem("authToken", data.token);
        safeLocalStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        return { success: true };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    safeLocalStorage.removeItem("authToken");
    safeLocalStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  // Get token function
  const getToken = useCallback((): string | null => {
    return safeLocalStorage.getItem("authToken");
  }, []);

  return { user, isLoading, login, logout, getToken };
}
