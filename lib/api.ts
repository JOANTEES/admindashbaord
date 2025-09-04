// API client for frontend-backend communication
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set JWT token for authenticated requests
  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  // Clear JWT token
  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  // Get token from localStorage
  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  // Generic request method
  private async request<T = unknown>(
    endpoint: string,
    options: {
      method?: string;
      body?: string;
      headers?: Record<string, string>;
    } = {}
  ): Promise<{ data: T; error?: string }> {
    try {
      const token = this.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: options.method || "GET",
        headers,
        body: options.body,
      });

      if (!response.ok) {
        const errorData = await response.text();
        return { data: {} as T, error: errorData };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return { data: {} as T, error: "Network error" };
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request("/auth/profile");
  }

  // Products endpoints (using existing backend)
  async getProducts() {
    return this.request("/products");
  }

  async getProductById(id: string | number) {
    return this.request(`/products/${id}`);
  }

  // TODO: Admin endpoints - these don't exist in your backend yet
  // For now, return mock data or empty responses
  async getDashboardStats() {
    // Return mock data since this endpoint doesn't exist
    return {
      data: {
        stats: {
          totalVisitors: 1250,
          totalPurchases: 89,
          totalUsers: 156,
          totalBookings: 23,
          totalClothes: 6,
          activeAdmins: 3,
        },
      },
    };
  }

  async getAdmins() {
    // Return mock data since this endpoint doesn't exist
    return {
      data: {
        admins: [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            phone: "+233 20 123 4567",
            role: "admin" as const,
            status: "active" as const,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "+233 24 987 6543",
            role: "moderator" as const,
            status: "active" as const,
            createdAt: "2024-01-15T00:00:00.000Z",
          },
        ],
      },
    };
  }

  async addAdmin(adminData: {
    name: string;
    email: string;
    phone: string;
    role: "admin" | "moderator";
    password: string;
  }) {
    // Mock response since this endpoint doesn't exist
    return {
      data: {
        message: "Admin added successfully (mock)",
        admin: {
          id: "3",
          ...adminData,
          status: "active",
          createdAt: new Date().toISOString(),
        },
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateAdminStatus(_id: string, _status: "active" | "inactive") {
    // Mock response since this endpoint doesn't exist
    return {
      data: {
        message: "Admin status updated successfully (mock)",
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteAdmin(_id: string) {
    // Mock response since this endpoint doesn't exist
    return {
      data: {
        message: "Admin deleted successfully (mock)",
      },
    };
  }

  // Clothes/Products endpoints - using existing /products endpoint
  async getClothes() {
    return this.request("/products");
  }

  async addClothes(productData: {
    title: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;
    size: string;
    color: string;
    stock: number;
  }) {
    // Map frontend fields to backend schema
    const payload = {
      name: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      size: productData.size,
      color: productData.color,
      stock_quantity: productData.stock,
      image_url: productData.imageUrl,
    } as Record<string, unknown>;

    // Remove undefined to avoid validation issues
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateProduct(
    id: number | string,
    updates: Partial<{
      title: string;
      description: string;
      price: number;
      category: string;
      size: string;
      color: string;
      stock: number;
      imageUrl?: string;
    }>
  ) {
    const payload = {
      name: updates.title,
      description: updates.description,
      price: updates.price,
      category: updates.category,
      size: updates.size,
      color: updates.color,
      stock_quantity: updates.stock,
      image_url: updates.imageUrl,
    } as Record<string, unknown>;

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteProduct(id: number | string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Bookings endpoints - these don't exist yet
  async getBookings() {
    // Return mock data since this endpoint doesn't exist
    return {
      data: {
        bookings: [
          {
            id: "1",
            customerName: "Alice Johnson",
            customerEmail: "alice@example.com",
            customerPhone: "+233 26 111 2222",
            eventType: "Wedding Reception",
            eventDate: "2024-02-15",
            eventTime: "18:00",
            duration: "4 hours",
            location: "Accra Conference Center",
            price: 2500,
            status: "confirmed",
            paymentStatus: "paid",
            notes: "Outdoor ceremony, indoor reception",
            createdAt: "2024-01-10T00:00:00.000Z",
          },
        ],
      },
    };
  }

  async addBooking(bookingData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventType: string;
    eventDate: string;
    eventTime: string;
    duration: string;
    location: string;
    price: number;
    notes?: string;
  }) {
    // Mock response since this endpoint doesn't exist
    return {
      data: {
        message: "Booking added successfully (mock)",
        booking: {
          id: "2",
          ...bookingData,
          status: "pending",
          paymentStatus: "pending",
          createdAt: new Date().toISOString(),
        },
      },
    };
  }

  // Users endpoints - connect to real backend
  async getUsers() {
    return this.request("/users");
  }

  async getUserById(id: string | number) {
    return this.request(`/users/${id}`);
  }

  async registerUser(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    id: string,
    userData: {
      first_name?: string;
      last_name?: string;
      email?: string;
      role?: string;
      phone?: string;
      department?: string;
      is_active?: boolean;
    }
  ) {
    const payload: Record<string, unknown> = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      department: userData.department,
      is_active: userData.is_active,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteUser(_id: string) {
    // TODO: Replace with real DELETE /users/:id endpoint when available
    return {
      data: {
        message: "User deleted successfully (mock)",
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateUserStatus(
    _id: string,
    _status: "active" | "inactive" | "suspended"
  ) {
    // TODO: Replace with real PATCH /users/:id/status endpoint when available
    return {
      data: {
        message: "User status updated successfully (mock)",
      },
    };
  }

  // Payments endpoints - these don't exist yet
  async getPayments() {
    // Return mock data since this endpoint doesn't exist
    return {
      data: {
        payments: [
          {
            id: "1",
            customerName: "Alice Johnson",
            customerEmail: "alice@example.com",
            amount: 2500,
            paymentMethod: "Mobile Money",
            status: "completed",
            transactionId: "TXN123456",
            date: "2024-01-15T14:30:00.000Z",
            description: "Wedding Reception Booking",
          },
        ],
      },
    };
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for better TypeScript support
export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "super_admin" | "admin" | "moderator";
  status: "active" | "inactive";
  createdAt: string;
}

export interface ClothItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  size: string;
  color: string;
  stock: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  duration: string;
  location: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "moderator" | "customer";
  status: "active" | "inactive";
  department: string;
  lastLogin: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: "Mobile Money" | "Bank Transfer" | "Cash" | "Credit Card";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId: string;
  date: string;
  description: string;
}

export interface DashboardStats {
  totalVisitors: number;
  totalPurchases: number;
  totalUsers: number;
  totalBookings: number;
  totalClothes: number;
  activeAdmins: number;
}

// Backend Product interface (matches your actual backend response)
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  size: string;
  color: string;
  stock_quantity: number;
  image_url: string | null;
  created_at: string;
}
