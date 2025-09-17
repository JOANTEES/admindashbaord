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
      responseType?: string;
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

      // Handle different response types
      if (options.responseType === "blob") {
        const blob = await response.blob();
        return { data: blob as T };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return { data: {} as T, error: "Network error" };
    }
  }

  // Public HTTP methods for general use
  async get<T = unknown>(
    endpoint: string,
    options?: { headers?: Record<string, string>; responseType?: string }
  ) {
    return this.request<T>(endpoint, {
      method: "GET",
      headers: options?.headers,
      responseType: options?.responseType,
    });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: { headers?: Record<string, string> }
  ) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: { headers?: Record<string, string> }
  ) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    options?: { headers?: Record<string, string> }
  ) {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers: options?.headers,
    });
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
    return this.request("/dashboard/stats");
  }

  async getAdmins() {
    // Get all users and filter for admins
    const response = await this.request("/users");
    const data = response.data as {
      users?: Array<{
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        role: string;
        is_active: boolean;
        created_at: string;
      }>;
    };
    const users = data.users || [];

    // Filter for admin role users and transform to admin format
    const admins = users
      .filter((user) => user.role === "admin")
      .map((user) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.is_active ? "active" : "inactive",
        createdAt: user.created_at,
      }));

    return {
      data: {
        admins,
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
    // Split name into first and last name
    const nameParts = adminData.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Use the register endpoint to create a new admin user
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: adminData.email,
        password: adminData.password,
        role: adminData.role === "moderator" ? "customer" : "admin", // Map moderator to customer for now
        phone: adminData.phone,
        department: "Administration",
      }),
    });

    const responseData = response.data as { user?: { id: string } };
    return {
      data: {
        message: "Admin added successfully",
        admin: {
          id: responseData.user?.id || "",
          name: adminData.name,
          email: adminData.email,
          phone: adminData.phone,
          role: adminData.role,
          status: "active",
          createdAt: new Date().toISOString(),
        },
      },
    };
  }

  async updateAdminStatus(id: string, status: "active" | "inactive") {
    // Use the user status update endpoint
    await this.request(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: status, // Backend expects 'status' field, not 'is_active'
      }),
    });

    return {
      data: {
        message: "Admin status updated successfully",
      },
    };
  }

  async deleteAdmin(id: string) {
    // Use the user delete endpoint
    const response = await this.request(`/users/${id}`, {
      method: "DELETE",
    });

    const responseData = response.data as {
      user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
    };
    return {
      data: {
        message: "Admin deleted successfully",
        user: responseData.user,
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
    requiresSpecialDelivery?: boolean;
    deliveryEligible?: boolean;
    pickupEligible?: boolean;
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
      requires_special_delivery: productData.requiresSpecialDelivery || false,
      delivery_eligible:
        productData.deliveryEligible !== undefined
          ? productData.deliveryEligible
          : true,
      pickup_eligible:
        productData.pickupEligible !== undefined
          ? productData.pickupEligible
          : true,
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
      requiresSpecialDelivery?: boolean;
      deliveryEligible?: boolean;
      pickupEligible?: boolean;
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
      requires_special_delivery: updates.requiresSpecialDelivery,
      delivery_eligible: updates.deliveryEligible,
      pickup_eligible: updates.pickupEligible,
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

  // Bookings endpoints
  async getBookings() {
    return this.request("/bookings");
  }

  async addBooking(bookingData: {
    name: string;
    email: string;
    phone?: string;
    eventTitle: string;
    eventType?: string;
    date: string;
    time?: string;
    duration?: number;
    location?: string;
    price: number;
    notes?: string;
  }) {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(
    id: string | number,
    status: "pending" | "confirmed" | "cancelled" | "completed"
  ) {
    return this.request(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async deleteBooking(id: string | number) {
    return this.request(`/bookings/${id}`, {
      method: "DELETE",
    });
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
      if (payload[key] === undefined || payload[key] === "")
        delete payload[key];
    });

    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteUser(_id: string) {
    return this.request(`/users/${_id}`, {
      method: "DELETE",
    });
  }

  async updateUserStatus(
    _id: string,
    _status: "active" | "inactive" | "suspended"
  ) {
    return this.request(`/users/${_id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: _status }),
    });
  }

  // Payments endpoints - updated for new payment system
  async getPayments() {
    return this.request("/payments");
  }

  async addPartialPayment(
    id: string | number,
    payload: {
      amount: number;
      method: "cash" | "bank_transfer" | "check" | "paystack";
      notes?: string;
    }
  ) {
    return this.request(`/payments/${id}/add-payment`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async updatePaymentStatus(
    id: string | number,
    status:
      | "pending"
      | "completed"
      | "failed"
      | "refunded"
      | "cancelled"
      | "partial"
  ) {
    return this.request(`/payments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Order Management API methods
  async getOrders(params?: {
    status?: string;
    paymentStatus?: string;
    deliveryMethod?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/orders/admin${queryString ? `?${queryString}` : ""}`);
  }

  async getOrder(id: string | number) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(
    id: string | number,
    status:
      | "pending"
      | "confirmed"
      | "processing"
      | "ready_for_pickup"
      | "shipped"
      | "out_for_delivery"
      | "delivered"
      | "completed"
      | "cancelled"
      | "refunded"
  ) {
    return this.request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Delivery Zones API methods
  async getDeliveryZones() {
    return this.request("/delivery-zones");
  }

  async getDeliveryZone(id: string) {
    return this.request(`/delivery-zones/${id}`);
  }

  async createDeliveryZone(data: {
    name: string;
    description: string;
    deliveryFee: number;
    estimatedDays: string;
    coverageAreas: string[];
  }) {
    return this.request("/delivery-zones", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDeliveryZone(
    id: string,
    data: {
      name?: string;
      description?: string;
      deliveryFee?: number;
      estimatedDays?: string;
      coverageAreas?: string[];
      isActive?: boolean;
    }
  ) {
    return this.request(`/delivery-zones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDeliveryZone(id: string) {
    return this.request(`/delivery-zones/${id}`, {
      method: "DELETE",
    });
  }

  async getAdminDeliveryZones() {
    return this.request("/delivery-zones/admin");
  }

  // App Settings API methods
  async getAppSettings() {
    return this.request<AppSettingsResponse>("/admin/settings");
  }

  async updateAppSettings(data: Partial<AppSettings>) {
    return this.request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Ghana Locations API methods
  async getGhanaRegions() {
    return this.request("/ghana/regions");
  }

  async getGhanaCities(regionId?: number) {
    const endpoint = regionId ? `/ghana/cities/${regionId}` : "/ghana/cities";
    return this.request(endpoint);
  }

  // Delivery Zone Areas API methods
  async addAreaToDeliveryZone(
    zoneId: string,
    areaData: {
      regionId: number;
      cityId: number;
      areaName: string;
    }
  ) {
    return this.request(`/delivery-zones/${zoneId}/areas`, {
      method: "POST",
      body: JSON.stringify(areaData),
    });
  }

  async removeAreaFromDeliveryZone(zoneId: string, areaId: string) {
    return this.request(`/delivery-zones/${zoneId}/areas/${areaId}`, {
      method: "DELETE",
    });
  }

  async getDeliveryZoneAreas(zoneId: string) {
    return this.request(`/delivery-zones/${zoneId}/areas`);
  }

  // Pickup Locations API methods
  async getPickupLocations() {
    return this.request("/pickup-locations");
  }

  async getPickupLocation(id: string) {
    return this.request(`/pickup-locations/${id}`);
  }

  async createPickupLocation(data: {
    name: string;
    description: string;
    regionId: number;
    cityId: number;
    areaName: string;
    landmark?: string;
    additionalInstructions?: string;
    contactPhone: string;
    contactEmail: string;
    operatingHours: Record<string, string>;
  }) {
    return this.request("/pickup-locations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePickupLocation(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      regionId: number;
      cityId: number;
      areaName: string;
      landmark?: string;
      additionalInstructions?: string;
      contactPhone: string;
      contactEmail: string;
      operatingHours: Record<string, string>;
    }>
  ) {
    return this.request(`/pickup-locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePickupLocation(id: string) {
    return this.request(`/pickup-locations/${id}`, {
      method: "DELETE",
    });
  }

  async getAdminPickupLocations() {
    return this.request("/pickup-locations/admin");
  }
}

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

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  deliveryFee: number;
  estimatedDays: string;
  coverageAreas: string[];
  structuredAreas?: DeliveryZoneArea[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GhanaRegion {
  id: number;
  name: string;
  code: string;
}

export interface GhanaCity {
  id: number;
  name: string;
  region_id: number;
  region_name: string;
  region_code: string;
}

export interface DeliveryZoneArea {
  id: number;
  delivery_zone_id: number;
  region_id: number;
  city_id: number;
  area_name: string;
  region_name?: string;
  city_name?: string;
}

export interface GhanaRegionsResponse {
  success: boolean;
  message: string;
  count: number;
  regions: GhanaRegion[];
}

export interface GhanaCitiesResponse {
  success: boolean;
  message: string;
  count: number;
  cities: GhanaCity[];
}

export interface DeliveryZonesResponse {
  success: boolean;
  message: string;
  count: number;
  zones: DeliveryZone[];
}

export interface DeliveryZoneAreasResponse {
  success: boolean;
  message: string;
  count: number;
  areas: DeliveryZoneArea[];
}

export interface AddAreaResponse {
  success: boolean;
  message: string;
  area: DeliveryZoneArea;
}

export interface CreateDeliveryZoneResponse {
  success: boolean;
  message: string;
  id: string;
  name: string;
  description: string;
  deliveryFee: number;
  estimatedDays: string;
  coverageAreas: string[];
  isActive: boolean;
  createdAt: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  description: string;
  regionName: string;
  cityName: string;
  areaName: string;
  landmark?: string;
  additionalInstructions?: string;
  contactPhone: string;
  contactEmail: string;
  operatingHours: Record<string, string>;
  googleMapsLink: string;
  createdAt: string;
}

export interface PickupLocationsResponse {
  success: boolean;
  message: string;
  count: number;
  locations: PickupLocation[];
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
  is_active: boolean;
  requires_special_delivery: boolean;
  delivery_eligible: boolean;
  pickup_eligible: boolean;
  created_at: string;
}

export interface AppSettings {
  id: number;
  taxRate: number;
  freeShippingThreshold: number;
  largeOrderQuantityThreshold: number;
  largeOrderDeliveryFee: number;
  currencySymbol: string;
  currencyCode: string;
  updatedAt: string;
}

export interface AppSettingsResponse {
  success: boolean;
  message: string;
  settings: AppSettings;
}
