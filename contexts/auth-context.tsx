"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  last_login?: string;
  oauth_provider?: string;
  profile_picture_url?: string;
  created_at: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  verifyResetToken: (token: string) => Promise<{
    success: boolean;
    error?: string;
    user?: { email: string; first_name: string };
  }>;
  initiateGoogleOAuth: () => void;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize authentication state on mount
  const initializeAuth = async () => {
    const token = apiClient.getToken();
    const refreshToken = apiClient.getRefreshToken();

    if (token && refreshToken) {
      try {
        // Verify token is still valid by getting profile
        const response = await apiClient.getProfile();
        if (response.data && !response.error) {
          const userData = (response.data as any).user;
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear everything
          apiClient.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        apiClient.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // Method to refresh authentication state (useful after OAuth callback)
  const refreshAuthState = async () => {
    setIsLoading(true);
    await initializeAuth();
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.login({ email, password });

      interface LoginResponse {
        success: boolean;
        message: string;
        user: User;
        token: string;
        refreshToken: string;
      }

      if (response.data && (response.data as LoginResponse).success) {
        const loginData = response.data as LoginResponse;

        // Store tokens
        apiClient.setTokens(loginData.token, loginData.refreshToken);

        // Update state
        setUser(loginData.user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return {
          success: false,
          error:
            response.error || (response.data as any)?.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.register(userData);

      interface RegisterResponse {
        success: boolean;
        message: string;
        user: User;
        token: string;
        refreshToken: string;
      }

      if (response.data && (response.data as RegisterResponse).success) {
        const registerData = response.data as RegisterResponse;

        // Store tokens
        apiClient.setTokens(registerData.token, registerData.refreshToken);

        // Update state
        setUser(registerData.user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return {
          success: false,
          error:
            response.error ||
            (response.data as any)?.message ||
            "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate tokens on server
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens and state regardless of API response
      apiClient.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.forgotPassword(email);

      if (response.data && (response.data as any).success) {
        return { success: true };
      } else {
        return {
          success: false,
          error:
            response.error ||
            (response.data as any)?.message ||
            "Failed to send reset email",
        };
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const verifyResetToken = async (
    token: string
  ): Promise<{
    success: boolean;
    error?: string;
    user?: { email: string; first_name: string };
  }> => {
    try {
      const response = await apiClient.verifyResetToken(token);

      if (response.data && (response.data as any).success) {
        return {
          success: true,
          user: (response.data as any).user,
        };
      } else {
        return {
          success: false,
          error:
            response.error ||
            (response.data as any)?.message ||
            "Invalid or expired reset token",
        };
      }
    } catch (error) {
      console.error("Verify reset token error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.resetPassword(token, password);

      if (response.data && (response.data as any).success) {
        return { success: true };
      } else {
        return {
          success: false,
          error:
            response.error ||
            (response.data as any)?.message ||
            "Failed to reset password",
        };
      }
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const initiateGoogleOAuth = () => {
    apiClient.initiateGoogleOAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        register,
        forgotPassword,
        verifyResetToken,
        resetPassword,
        initiateGoogleOAuth,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
