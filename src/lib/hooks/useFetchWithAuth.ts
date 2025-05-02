"use client";

import { useAuth } from "./useAuth";
import { useCallback, useRef } from "react";

interface UseFetchWithAuthReturn {
  fetchWithAuth: <T>(url: string, options?: RequestInit) => Promise<T>;
}

export function useFetchWithAuth(): UseFetchWithAuthReturn {
  const { getToken } = useAuth();

  // Store the token in a ref to prevent changes when the token doesn't actually change
  const tokenRef = useRef<string | null>(null);

  // Update the token ref whenever getToken is called
  const getAuthToken = useCallback(() => {
    const newToken = getToken();
    tokenRef.current = newToken;
    return newToken;
  }, [getToken]);

  const fetchWithAuth = useCallback(
    async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      const token = getAuthToken();

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      // Add cache-busting query parameter for GET requests
      let finalUrl = url;
      if (options.method === undefined || options.method === "GET") {
        const separator = url.includes("?") ? "&" : "?";
        finalUrl = `${url}${separator}_t=${Date.now()}`;
      }

      const response = await fetch(finalUrl, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "API request failed");
      }

      return response.json();
    },
    [getAuthToken]
  );

  return { fetchWithAuth };
}
