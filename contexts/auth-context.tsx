"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount
    const authStatus = localStorage.getItem("isAuthenticated")
    const email = localStorage.getItem("userEmail")
    
    if (authStatus === "true" && email) {
      setIsAuthenticated(true)
      setUserEmail(email)
    }
  }, [])

  // ✅ New (real API)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login({ email, password })
      
      interface LoginResponse {
        message: string;
        user: {
          id: number;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
        };
        token: string;
      }
      
      if (response.data && (response.data as LoginResponse).token) {
        const loginData = response.data as LoginResponse
        apiClient.setToken(loginData.token)
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userEmail", email)
        localStorage.setItem("userData", JSON.stringify(loginData.user))
        setIsAuthenticated(true)
        setUserEmail(email)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    // Clear JWT token
    apiClient.clearToken()
    
    // Clear localStorage
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userData")
    
    setIsAuthenticated(false)
    setUserEmail(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 