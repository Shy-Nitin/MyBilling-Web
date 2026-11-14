import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid corporate email.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        navigate("/");
      }, 1000);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <main className="w-full bg-surface min-h-screen flex items-center justify-center p-margin">
        <div className="flex flex-col w-full items-center justify-center relative overflow-hidden py-12 px-4 selection:bg-primary selection:text-on-primary">
          {/* Subtle Ambient Radiant Backdrops */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-secondary-container/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-tertiary-fixed/20 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[34rem] bg-gradient-to-tr from-primary/5 via-tertiary/5 to-accent-lavender/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Main Container */}
          <div className="relative w-full max-w-[460px] z-10">
            {/* Top Meta Security Chip */}
            <div className="flex items-center justify-center gap-space-xs mb-space-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/60 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse" />
                <span className="font-label-mono-sm text-label-mono-sm text-text-secondary tracking-wide uppercase">
                  Institutional Tier Security
                </span>
              </div>
            </div>

            {/* Elevated Auth Card */}
            <div className="relative rounded-xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl shadow-primary/5 p-8 md:p-10 transition-all duration-300">
              {/* Brand Logo Presentation */}
              <div className="flex flex-col items-center text-center">
                <Link to="/" className="relative group block">
                  <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-primary-container via-accent-violet-light to-tertiary-fixed opacity-70 blur-md group-hover:opacity-100 transition duration-500" />
                  <div className="relative w-16 h-16 rounded-xl bg-surface-card p-2 shadow-sm flex items-center justify-center overflow-hidden">
                    <img
                      src="/logo.svg"
                      alt="MyBilling Logo"
                      className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <h1 className="mt-space-lg font-headline-md text-headline-md text-on-surface tracking-tight">
                  Welcome back to MyBilling
                </h1>
                <p className="mt-space-xs font-body-md text-body-md text-text-muted max-w-sm">
                  Enter your credentials to access your distributor dashboard.
                </p>
              </div>

              {/* Credential Form */}
              <form className="mt-space-xl flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-mono-sm text-label-mono-sm text-text-secondary uppercase" htmlFor="email">
                    Work Email
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-text-muted pointer-events-none text-xl transition-colors">
                      mail
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="name@company.com"
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-low focus:bg-surface-card text-on-surface placeholder:text-text-muted/60 rounded-lg font-body-md text-body-md shadow-inner transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {emailError && (
                    <span className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-sm">error</span> {emailError}
                    </span>
                  )}
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-mono-sm text-label-mono-sm text-text-secondary uppercase" htmlFor="password">
                      Password
                    </label>
                    <a
                      href="#"
                      className="font-body-sm text-body-sm text-primary hover:text-secondary-container transition-colors focus:outline-none"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-text-muted pointer-events-none text-xl transition-colors">
                      lock
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-11 pr-11 bg-surface-container-low focus:bg-surface-card text-on-surface placeholder:text-text-muted/60 rounded-lg font-body-md text-body-md shadow-inner transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 rounded-md text-text-muted hover:text-on-surface transition-colors focus:outline-none flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {passwordError && (
                    <span className="font-body-sm text-body-sm text-error flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-sm">error</span> {passwordError}
                    </span>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="relative flex items-center gap-2.5 cursor-pointer select-none group">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded bg-surface-container-highest border border-outline-variant/30 peer-checked:bg-primary peer-checked:border-primary peer-checked:shadow-sm flex items-center justify-center transition-all duration-200 active:scale-95">
                      <svg
                        className={`w-3 h-3 text-white transition-all duration-300 ease-out ${
                          rememberMe ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        }`}
                        fill="none"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="font-body-sm text-body-sm text-text-secondary group-hover:text-on-surface transition-colors">
                      Remember me for 30 days
                    </span>
                  </label>
                </div>

                {/* Sign In Submit Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="relative w-full h-11 mt-1 bg-primary text-on-primary font-body-md text-body-md font-medium rounded-lg flex items-center justify-center gap-2 overflow-hidden shadow-md shadow-primary/25 hover:bg-secondary-container hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] transition-all duration-200 group"
                  id="submitBtn"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isAuthenticating ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        Sign In to Dashboard
                        <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                </button>
              </form>

              {/* SSO Divider */}
              <div className="relative my-7 flex items-center justify-center">
                <div className="w-full h-px bg-surface-container-highest" />
                <span className="absolute px-3 bg-surface-card font-label-mono-sm text-label-mono-sm text-text-muted uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              {/* Single Sign-On Provider Stack */}
              <div className="grid grid-cols-2 gap-3">
                {/* Google SSO */}
                <button
                  type="button"
                  className="h-10 px-3 flex items-center justify-center gap-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm shadow-sm transition-all duration-150 active:scale-[0.98] group"
                >
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span className="font-medium">Google</span>
                </button>

                {/* Microsoft SSO */}
                <button
                  type="button"
                  className="h-10 px-3 flex items-center justify-center gap-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm shadow-sm transition-all duration-150 active:scale-[0.98] group"
                >
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 21 21">
                    <rect fill="#f25022" height="9" width="9" x="1" y="1" />
                    <rect fill="#7fba00" height="9" width="9" x="11" y="1" />
                    <rect fill="#00a4ef" height="9" width="9" x="1" y="11" />
                    <rect fill="#ffb900" height="9" width="9" x="11" y="11" />
                  </svg>
                  <span className="font-medium">Microsoft 365</span>
                </button>
              </div>

              {/* Footer Inside Card */}
              <div className="mt-8 pt-6 border-t-0 bg-surface-container-low/40 -mx-8 -mb-8 md:-mx-10 md:-mb-10 px-8 py-5 rounded-b-xl text-center">
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Don't have a MyBilling account?
                  <Link
                    to="/signup"
                    className="font-medium text-primary hover:text-secondary-container transition-colors ml-1 inline-flex items-center gap-0.5"
                  >
                    <span>Sign up for free</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </Link>
                </p>
              </div>
            </div>

            {/* Security & Trust Indicators */}
            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <div className="inline-flex items-center gap-2 text-text-muted">
                <div className="relative flex items-center justify-center shrink-0 w-4 h-4 rounded-full bg-success-emerald/10 text-success-emerald">
                  <svg className="w-3.5 h-3.5 text-success-emerald" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-label-mono-sm text-label-mono-sm tracking-wide">
                  256-bit SSL Encrypted • SOC2 Type II Certified
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 text-text-muted font-body-sm text-body-sm">
                <a className="hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
                <span>•</span>
                <a className="hover:text-on-surface transition-colors" href="#">Terms of Service</a>
                <span>•</span>
                <a className="hover:text-on-surface transition-colors" href="#">System Status</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default LoginPage;