/**
 * API Client for Restaurant Management System
 * Centralized HTTP client with authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Get token from localStorage
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("auth-storage");
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const token = parsed.state?.accessToken;

          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
            console.log("[API Client] Token found and added to headers");
          } else {
            console.warn("[API Client] No accessToken found in auth-storage");
            console.log("[API Client] Auth data structure:", parsed);
          }
        } catch (error) {
          console.error("[API Client] Failed to parse auth data:", error);
        }
      } else {
        console.warn("[API Client] No auth-storage found in localStorage");
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || `HTTP Error: ${response.status}`;
        console.error(`[API Client] ${options.method || "GET"} ${endpoint} failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: data,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.error(`[API Client] Error [${options.method || "GET"} ${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new APIClient(API_URL);
