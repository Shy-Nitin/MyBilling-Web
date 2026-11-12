const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

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

  private handleFetchError(err: any): never {
    const msg = err?.message || String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch error")) {
      throw new Error(
        "Backend server is not reachable on port 8000. Please start the backend with 'python run_backend.py' in a terminal."
      );
    }
    throw err;
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    try {
      const url = this.buildUrl(path, params);
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      this.handleFetchError(err);
    }
  }

  async post<T>(path: string, body?: any): Promise<T> {
    try {
      const url = this.buildUrl(path);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      this.handleFetchError(err);
    }
  }

  async put<T>(path: string, body?: any): Promise<T> {
    try {
      const url = this.buildUrl(path);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      this.handleFetchError(err);
    }
  }

  async delete<T>(path: string): Promise<T> {
    try {
      const url = this.buildUrl(path);
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      this.handleFetchError(err);
    }
  }

  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    try {
      const url = this.buildUrl(path);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          // Note: browser will automatically set Content-Type: multipart/form-data with boundary
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      this.handleFetchError(err);
    }
  }

  getPdfUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}

export const apiClient = new ApiClient(BASE_URL);
