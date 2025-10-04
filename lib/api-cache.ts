// API Cache and Performance Optimization Utilities

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RequestOptions {
  cacheTime?: number; // Cache duration in milliseconds
  staleTime?: number; // How long data is considered fresh
  retryCount?: number;
  retryDelay?: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private defaultCacheTime = 5 * 60 * 1000; // 5 minutes
  private defaultStaleTime = 1 * 60 * 1000; // 1 minute

  generateKey(endpoint: string, options?: RequestOptions): string {
    return `${endpoint}:${JSON.stringify(options || {})}`;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private isStale(entry: CacheEntry<unknown>, staleTime: number): boolean {
    return Date.now() - entry.timestamp > staleTime;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry || this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, cacheTime?: number): void {
    const now = Date.now();
    const expiresAt = now + (cacheTime || this.defaultCacheTime);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  isStaleData<T>(key: string, staleTime?: number): boolean {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry || this.isExpired(entry)) {
      return true;
    }
    return this.isStale(entry, staleTime || this.defaultStaleTime);
  }

  hasPendingRequest(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  setPendingRequest<T>(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, promise);
  }

  getPendingRequest<T>(key: string): Promise<T> | null {
    return this.pendingRequests.get(key) as Promise<T> | null;
  }

  clearPendingRequest(key: string): void {
    this.pendingRequests.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const apiCache = new ApiCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

// Enhanced API client with caching and performance optimizations
export class OptimizedApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  private async request<T = unknown>(
    endpoint: string,
    options: {
      method?: string;
      body?: string;
      headers?: Record<string, string>;
      responseType?: string;
      cacheTime?: number;
      staleTime?: number;
      retryCount?: number;
      retryDelay?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<{ data: T; error?: string; fromCache?: boolean }> {
    const {
      method = "GET",
      body,
      headers = {},
      responseType,
      cacheTime,
      retryCount = 3,
      retryDelay = 1000,
      skipCache = false,
    } = options;

    const cacheKey = apiCache.generateKey(endpoint, options);
    
    // Check cache first (only for GET requests)
    if (method === "GET" && !skipCache) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        return { 
          data: cachedData, 
          fromCache: true,
          // Note: We could return stale data immediately and refetch in background
        };
      }

      // Check for pending request to avoid duplicate calls
      const pendingRequest = apiCache.getPendingRequest<{ data: T; error?: string }>(cacheKey);
      if (pendingRequest) {
        return pendingRequest;
      }
    }

    const makeRequest = async (): Promise<{ data: T; error?: string }> => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const token = this.getToken();
          const requestHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            ...headers,
          };

          if (token) {
            requestHeaders["Authorization"] = `Bearer ${token}`;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(`${this.baseURL}${endpoint}`, {
            method,
            headers: requestHeaders,
            body,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
          }

          let data: T;
          if (responseType === "blob") {
            data = (await response.blob()) as T;
          } else {
            data = await response.json();
          }

          // Cache successful GET requests
          if (method === "GET" && !skipCache) {
            apiCache.set(cacheKey, data, cacheTime);
          }

          return { data };
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry on certain errors
          if (error instanceof Error && (
            error.name === 'AbortError' || 
            error.message.includes('401') || 
            error.message.includes('403')
          )) {
            break;
          }

          // Wait before retrying (exponential backoff)
          if (attempt < retryCount) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          }
        }
      }

      return { 
        data: {} as T, 
        error: lastError?.message || "Network error" 
      };
    };

    const requestPromise = makeRequest();
    
    // Store pending request to prevent duplicates
    if (method === "GET" && !skipCache) {
      apiCache.setPendingRequest(cacheKey, requestPromise);
      requestPromise.finally(() => {
        apiCache.clearPendingRequest(cacheKey);
      });
    }

    return requestPromise;
  }

  // Public HTTP methods with caching
  async get<T = unknown>(
    endpoint: string, 
    options?: { 
      headers?: Record<string, string>; 
      responseType?: string;
      cacheTime?: number;
      staleTime?: number;
      retryCount?: number;
      retryDelay?: number;
      skipCache?: boolean;
    }
  ) {
    return this.request<T>(endpoint, {
      method: "GET",
      ...options,
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
      ...options,
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
      ...options,
    });
  }

  async delete<T = unknown>(
    endpoint: string, 
    options?: { headers?: Record<string, string> }
  ) {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }

  // Invalidate cache for specific endpoint
  invalidateCache(endpoint: string) {
    const keysToDelete: string[] = [];
    for (const key of apiCache['cache'].keys()) {
      if (key.startsWith(endpoint)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => apiCache['cache'].delete(key));
  }
}

// Create optimized API client instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const optimizedApiClient = new OptimizedApiClient(API_BASE_URL);
