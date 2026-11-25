import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { MyBillingLoader } from "@/components/common/MyBillingLoader";
import { apiClient } from "@/services/api/apiClient";
import { useAuth, User } from "@/context/AuthContext";

function parseHashParams(hash: string): URLSearchParams {
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(cleaned);
}

export function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession, isAuthenticated } = useAuth();

  const isResetRoute = location.pathname === "/reset-password";
  const rawHash = location.hash || (typeof window !== "undefined" ? window.location.hash : "");
  const rawSearch = location.search || (typeof window !== "undefined" ? window.location.search : "");
  const hashParams = parseHashParams(rawHash);
  const queryParams = new URLSearchParams(rawSearch);

  const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
  const authType = hashParams.get("type") || queryParams.get("type");
  const urlError =
    hashParams.get("error_description") ||
    queryParams.get("error_description") ||
    hashParams.get("error") ||
    queryParams.get("error");

  const isRecovery = isResetRoute || authType === "recovery";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusError, setStatusError] = useState<string>(urlError || "");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Google OAuth callback automatically
  useEffect(() => {
    if (isRecovery || urlError) return;
    if (!accessToken) {
      if (isAuthenticated) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setStatusError("Invalid or incomplete sign-in callback. Please try signing in again.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.post<{ access_token: string; user: User }>(
          "/auth/supabase-login",
          { access_token: accessToken }
        );
        if (!cancelled) {
          setSession(res.access_token, res.user);
          navigate("/dashboard", { replace: true });
        }
      } catch (err: any) {
        if (!cancelled) {
          setStatusError(err?.message || "Google sign-in failed. Please try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, isRecovery, urlError, isAuthenticated, navigate, setSession]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setStatusError("Reset link is invalid or has expired. Please request a new link.");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setStatusError("Password must be 8+ chars with at least 1 uppercase letter and 1 number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusError("Passwords do not match.");
      return;
    }

    setStatusError("");
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<{ message: string }>("/auth/supabase-reset-password", {
        access_token: accessToken,
        new_password: newPassword,
      });
      setSuccessMsg(res.message || "Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err: any) {
      setStatusError(err?.message || "Reset link is invalid or expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRecovery && !statusError) {
    return <MyBillingLoader fullScreen message="Completing secure Google sign-in..." />;
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest shadow-xl border border-slate-200/70 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="mb-3">
            <Logo className="w-12 h-12 rounded-xl" />
          </Link>
          <h1 className="font-headline-md text-xl font-bold text-on-surface">
            {isRecovery ? "Reset Your Password" : "Authentication Issue"}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {isRecovery
              ? "Choose a strong new password for your MyBilling account."
              : "We could not complete your sign-in request."}
          </p>
        </div>

        {statusError && (
          <div className="mb-4 p-3 rounded-lg bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{statusError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {isRecovery && accessToken && !successMsg && (
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-label-mono-sm text-[11px] text-text-secondary uppercase block mb-1">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className="w-full h-10 px-3 pr-10 bg-surface-container-low rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-text-muted hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-label-mono-sm text-[11px] text-text-secondary uppercase block mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs font-semibold text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthCallbackPage;
