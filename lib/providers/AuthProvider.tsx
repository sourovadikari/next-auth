"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";

// Define the User type for clarity and type safety
// This type should match the structure of the user object returned by your /api/auth/me endpoint
export interface UserData { // Renamed to UserData for consistency with previous files
  email: string;
  name: string | null; // IMPORTANT: Allow name to be string or null
  role: string;
  id: string; // Ensure 'id' is included as it's used in JWT payload
  emailVerified: boolean; // Add emailVerified if your user object includes it
}

export interface UserSession {
  userId: string; // The MongoDB ObjectId converted to string
  email: string;
  name?: string | null; // Optional, as it might not always be present or can be null
  role?: string; // Optional, default to 'user'
  iat?: number; // Issued At (timestamp)
  exp?: number; // Expiration Time (timestamp)
}


// Define the shape of the AuthContext
export interface AuthContextType {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  loading: boolean;
  signOut: () => Promise<void>;
  revalidateSession: () => Promise<void>;
  deleteAccount: () => Promise<boolean>; // Returns true on successful deletion, false otherwise
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap your application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname(); // Detects route changes to refetch user status

  // useCallback to memoize the fetchUser function
  const fetchUser = useCallback(async () => {
    setLoading(true); // Set loading true at the start of fetch
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // Send cookies with the request
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        // If response is not OK or data.user is null, set user to null
        setUser(null);
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Error fetching user:", errorMessage);
      setUser(null);
    } finally {
      setLoading(false); // Set loading false after fetch completes
    }
  }, []); // No dependencies, as it only depends on global fetch (which is stable)

  // Effect to fetch user on initial mount and on route changes
  useEffect(() => {
    fetchUser();
  }, [pathname, fetchUser]); // Re-fetch user on route change or if fetchUser identity changes

  // Function to handle user sign out
  const signOut = useCallback(async () => {
    setLoading(true); // Indicate loading during sign out process
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include", // Send cookies to clear the token
      });
      if (res.ok) {
        setUser(null); // Clear user state on successful sign out
        // No explicit router.push here, let the consuming component handle redirect if needed
        // or rely on the global route protection if user becomes null.
      } else {
        const errorData = await res.json();
        console.error("Sign out failed:", errorData.error || res.statusText);
        // Even if sign out API fails, we should attempt to clear client-side state
        setUser(null);
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Network error during sign out:", errorMessage);
      setUser(null); // Clear user state even on network error
    } finally {
      setLoading(false); // End loading
    }
  }, []);

  // Function to explicitly re-validate the session
  const revalidateSession = useCallback(async () => {
    await fetchUser(); // Just call the existing fetchUser logic
  }, [fetchUser]);

  // NEW: Function to handle account deletion
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    if (!user || !user.id) {
      console.error("Cannot delete account: User not authenticated or ID missing.");
      return false;
    }

    setLoading(true); // Indicate loading during deletion process
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE", // IMPORTANT: Use DELETE method as per RESTful practices and backend API
        credentials: "include", // Send cookies with the request (JWT token)
        // body: JSON.stringify({ userId: user.id }), // REMOVED: Backend now derives userId from JWT for security
      });

      if (res.ok) {
        setUser(null); // Clear user state on successful deletion
        console.log("Account deleted successfully.");
        return true;
      } else {
        const data = await res.json();
        console.error("Failed to delete account:", data.error || res.statusText);
        // If deletion fails due to auth issues (e.g., token invalid), clear user state
        if (res.status === 401 || res.status === 403) {
          setUser(null);
        }
        return false;
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Network error during account deletion:", errorMessage);
      return false;
    } finally {
      setLoading(false); // End loading
    }
  }, [user]); // Depend on 'user' to ensure we have the ID for checks

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signOut, revalidateSession, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
