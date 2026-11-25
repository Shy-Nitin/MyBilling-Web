const BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? "/api/v1" : "http://127.0.0.1:8000/api/v1");

let inMemoryAccessToken: string | null = null;
let activeTenantUserId: number | null = (() => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("mybilling_active_tenant_user_id");
  return stored ? parseInt(stored, 10) : null;
})();
let onUnauthorizedCallback: (() => void) | null = null;
let refreshPromise: Promise<{ access_token: string; user?: any }> | null = null;

// Lightweight in-memory GET cache with 30s TTL + in-flight deduplication
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const getCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 30_000; // 30 seconds

export const setAuthToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAuthToken = () => inMemoryAccessToken;

export const setActiveTenantUserId = (userId: number | null) => {
  activeTenantUserId = userId;
  if (typeof window !== "undefined") {
    if (userId) {
      localStorage.setItem("mybilling_active_tenant_user_id", String(userId));
    } else {
      localStorage.removeItem("mybilling_active_tenant_user_id");
    }
  }
  getCache.clear();
  inFlightRequests.clear();
};

export const getActiveTenantUserId = () => activeTenantUserId;

export const setOnUnauthorized = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const fullPath = `${this.baseUrl}${path}`;
    let url: URL;
    try {
      url = fullPath.startsWith("http")
        ? new URL(fullPath)
        : new URL(fullPath, typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");
    } catch {
      url = new URL(`http://127.0.0.1:8000/api/v1${path}`);
    }

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    return url.toString();
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...customHeaders,
    };
    if (inMemoryAccessToken) {
      headers["Authorization"] = `Bearer ${inMemoryAccessToken}`;
    }
    if (activeTenantUserId) {
      headers["X-Active-User-Id"] = String(activeTenantUserId);
    }
    return headers;
  }

  async refreshSession(): Promise<{ access_token: string; user?: any }> {
    // If a refresh request is already in-flight, reuse the same promise to prevent race conditions
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const res = await fetch(this.buildUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          inMemoryAccessToken = null;
          throw new Error("Session expired. Please log in again.");
        }

        const data = await res.json();
        inMemoryAccessToken = data.access_token;
        return data;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  async refreshAccessToken(): Promise<string> {
    const data = await this.refreshSession();
    return data.access_token;
  }

  private async requestRaw(
    path: string,
    options: RequestInit,
    params?: Record<string, any>,
    retryOn401 = true
  ): Promise<Response> {
    const url = this.buildUrl(path, params);
    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers: this.getHeaders((options.headers as Record<string, string>) || {}),
    };

    let res: Response;
    try {
      res = await fetch(url, config);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch error")) {
        throw new Error("Backend server is unreachable on port 8000. Please start the backend service.");
      }
      throw err;
    }

    if (res.status === 401 && retryOn401 && !path.includes("/auth/")) {
      try {
        const { access_token } = await this.refreshSession();
        const retryOptions: RequestInit = {
          ...options,
          credentials: "include",
          headers: {
            ...((options.headers as Record<string, string>) || {}),
            Authorization: `Bearer ${access_token}`,
          },
        };
        return this.requestRaw(path, retryOptions, params, false);
      } catch (refreshErr) {
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        throw refreshErr;
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }

    return res;
  }

  private async request<T>(
    path: string,
    options: RequestInit,
    params?: Record<string, any>,
    retryOn401 = true
  ): Promise<T> {
    const res = await this.requestRaw(path, options, params, retryOn401);
    if (res.status === 204) {
      return {} as T;
    }
    return res.json();
  }

  async downloadBlob(path: string, params?: Record<string, any>): Promise<Blob> {
    const res = await this.requestRaw(
      path,
      {
        method: "GET",
        headers: {
          Accept: "application/pdf, application/octet-stream, */*",
        },
      },
      params,
      true
    );
    return res.blob();
  }

  clearCache() {
    getCache.clear();
    inFlightRequests.clear();
  }

  async get<T>(path: string, params?: Record<string, any>, bypassCache = false): Promise<T> {
    const url = this.buildUrl(path, params);
    const cacheKey = `${url}#tenant:${activeTenantUserId || "self"}`;

    if (!bypassCache) {
      const cached = getCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data as T;
      }
      const inFlight = inFlightRequests.get(cacheKey);
      if (inFlight) {
        return inFlight as Promise<T>;
      }
    }

    const reqPromise = (async () => {
      try {
        const data = await this.request<T>(path, { method: "GET" }, params);
        getCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, reqPromise);
    return reqPromise;
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const res = await this.request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    this.clearCache();
    return res;
  }

  async put<T>(path: string, body?: any): Promise<T> {
    const res = await this.request<T>(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    this.clearCache();
    return res;
  }

  async delete<T>(path: string): Promise<T> {
    const res = await this.request<T>(path, { method: "DELETE" });
    this.clearCache();
    return res;
  }

  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const url = this.buildUrl(path);
    const headers: Record<string, string> = {};
    if (inMemoryAccessToken) {
      headers["Authorization"] = `Bearer ${inMemoryAccessToken}`;
    }
    if (activeTenantUserId) {
      headers["X-Active-User-Id"] = String(activeTenantUserId);
    }

    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }

    this.clearCache();
    return res.json();
  }

  getPdfUrl(path: string): string {
    return this.buildUrl(path);
  }
}

export const apiClient = new ApiClient(BASE_URL);
