import { apiClient } from "./apiClient";

interface SupabasePublicConfig {
  url: string;
  anon_key: string;
}

let cachedConfig: SupabasePublicConfig | null = null;

export async function getSupabaseConfig(): Promise<SupabasePublicConfig> {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl.replace(/\/$/, ""), anon_key: envKey };
  }
  if (cachedConfig?.url && cachedConfig?.anon_key) {
    return cachedConfig;
  }
  const res = await apiClient.get<SupabasePublicConfig>("/auth/supabase-config");
  if (!res.url || !res.anon_key) {
    throw new Error("Supabase URL or Anon Key is not configured.");
  }
  cachedConfig = { url: res.url.replace(/\/$/, ""), anon_key: res.anon_key };
  return cachedConfig;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const { url, anon_key } = await getSupabaseConfig();
  const redirectTo = `${window.location.origin}/reset-password`;
  const res = await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: {
      apikey: anon_key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || err.error_description || err.message || "Failed to send reset link.");
  }
}

export async function startGoogleOAuth(): Promise<void> {
  const { url } = await getSupabaseConfig();
  const redirectTo = `${window.location.origin}/auth/callback`;
  window.location.href = `${url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
}
