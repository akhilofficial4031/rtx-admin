"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import { colors } from "@/lib/colors";
import Sidebar from "@/app/shared/components/sidebar";
import Header from "@/app/shared/components/header";

// Create a context to share user data across authenticated routes
import { createContext, useContext } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  userData: UserData | null;
  isLoadingUserData: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userData: null,
  isLoadingUserData: false,
  error: null,
  refreshUserData: async () => {},
});

export const useUserData = () => useContext(AuthContext);

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { fetchWithAuth } = useFetchWithAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar on route change or window resize for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    // Set sidebar open by default for desktop
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }

    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isSidebarOpen]);

  // Fetch user data function
  const fetchUserData = async () => {
    if (!user) return;

    setIsLoadingUserData(true);
    setError(null);

    try {
      const response = await fetchWithAuth<{ user: UserData }>("/api/users/me");
      setUserData(response.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
    } finally {
      setIsLoadingUserData(false);
      setInitialized(true);
    }
  };

  // Authentication check
  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login");
      } else if (!initialized) {
        // Fetch user data when authenticated and not initialized
        fetchUserData();
      }
    }
  }, [user, isLoadingAuth, initialized, router]);

  // If loading authentication, show loading spinner
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="animate-spin h-10 w-10 border-4 rounded-full border-t-transparent"
          style={{
            borderColor: `${colors.primary.main} transparent transparent transparent`,
          }}
        ></div>
      </div>
    );
  }

  // If not authenticated, show message while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  // Provide user data to all child components
  return (
    <AuthContext.Provider
      value={{
        userData,
        isLoadingUserData,
        error,
        refreshUserData: fetchUserData,
      }}
    >
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
