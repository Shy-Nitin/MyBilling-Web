import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Password strength calculation
  const strength = useMemo(() => {
    if (!password) return { text: "Awaiting input", score: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 1) return { text: "Weak", score: 1 };
    if (score === 2) return { text: "Medium", score: 2 };
    if (score >= 3) return { text: "Strong", score: 3 };
    return { text: "Weak", score: 1 };
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !businessName.trim() || !workEmail.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!termsAccepted) {
      setErrorMsg("Please accept the terms to proceed.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/");
    }, 1200);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <main className="w-full bg-surface min-h-screen flex items-center justify-center p-margin">
        <div className="flex flex-col w-full max-w-6xl mx-auto my-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl shadow-xl overflow-hidden bg-surface-card relative">
            {/* Left Column: High-Impact Showcase & Social Proof */}
            <div className="lg:col-span-5 bg-gradient-to-br from-primary via-secondary to-tertiary p-8 lg:p-12 text-on-primary flex flex-col justify-between relative overflow-hidden">
              {/* Ambient Glow Orb Behind Content */}
              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-accent-violet-light/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-tertiary-fixed/15 blur-3xl pointer-events-none" />

              {/* Header & Brand Presentation */}
              <div className="relative z-10 flex flex-col gap-6">
                <Link to="/" className="flex items-center gap-3 w-fit">
                  <div className="w-12 h-12 rounded-xl bg-surface-card/10 backdrop-blur-md p-1.5 shadow-sm flex items-center justify-center">
                    <img
                      src="/logo.svg"
                      alt="MyBilling Logo"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm tracking-tight text-on-primary font-bold">
                      MyBilling
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container tracking-wider uppercase">
                      FMCG &amp; Wholesale Cloud
                    </span>
                  </div>
                </Link>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-on-primary/10 backdrop-blur-md w-fit">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" />
                    <span className="font-label-mono-sm text-label-mono-sm text-on-primary-container">
                      v3.8 Enterprise Suite
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-primary leading-tight font-semibold">
                    Start billing faster today.
                  </h1>
                  <p className="font-body-md text-body-md text-on-primary-container/90 mt-1">
                    Accelerate bulk orders, eradicate manual tally errors, and synchronize inventory dispatch with institutional speed.
                  </p>
                </div>

                {/* Value Bullet Points */}
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-tertiary-fixed/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-tertiary-fixed text-base font-bold">
                        check
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-on-primary">
                        14-day free trial, all features included
                      </span>
                      <span className="font-body-sm text-body-sm text-on-primary-container/80">
                        Full multi-warehouse and GST module unlocked.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-tertiary-fixed/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-tertiary-fixed text-base font-bold">
                        check
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-on-primary">
                        No credit card required
                      </span>
                      <span className="font-body-sm text-body-sm text-on-primary-container/80">
                        Instant onboarding in under 120 seconds.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-tertiary-fixed/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-tertiary-fixed text-base font-bold">
                        check
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-on-primary">
                        Unlimited products, shops &amp; invoices
                      </span>
                      <span className="font-body-sm text-body-sm text-on-primary-container/80">
                        Zero throttling or ledger rate limits during peak dispatches.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-tertiary-fixed/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-tertiary-fixed text-base font-bold">
                        check
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-on-primary">
                        Free 1-on-1 catalog migration support
                      </span>
                      <span className="font-body-sm text-body-sm text-on-primary-container/80">
                        Dedicated FMCG ledger specialist transitions your data.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Quote Card */}
              <div className="relative z-10 mt-10 p-5 rounded-xl bg-on-primary/10 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-1 text-warning-amber mb-2">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-primary ml-2 font-semibold">5.0 / 5.0</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-primary leading-relaxed italic">
                  “MyBilling cut our daily dispatch and reconciliation time by 65%. The speed of high-frequency line item entry is unmatched in modern FMCG tooling.”
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="font-body-sm text-body-sm font-semibold text-on-primary">Rajesh K.</p>
                    <p className="font-label-mono-sm text-label-mono-sm text-on-primary-container">
                      Managing Partner, Apex FMCG Logistics
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-tertiary-fixed text-2xl opacity-60">
                    verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-surface-card relative">
              <div className="max-w-xl mx-auto w-full">
                {/* Form Header */}
                <div className="flex flex-col gap-1 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-label-mono-sm text-label-mono-sm text-primary uppercase tracking-wider font-semibold">
                      Registration Flow
                    </span>
                    <span className="font-label-mono-sm text-label-mono-sm text-text-muted bg-surface-container-low px-2 py-0.5 rounded-full">
                      Step 1 of 2
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                    Create your MyBilling account
                  </h2>
                  <p className="font-body-md text-body-md text-text-muted">
                    Setup takes less than 2 minutes. Enter business particulars below.
                  </p>
                </div>

                {/* Registration Form Inputs */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">error</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-sm text-body-sm font-medium text-text-secondary" htmlFor="fullName">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-text-muted pointer-events-none text-xl">
                          person
                        </span>
                        <input
                          id="fullName"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Vikram Sharma"
                          className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                        />
                      </div>
                    </div>

                    {/* Business / Distribution Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-sm text-body-sm font-medium text-text-secondary" htmlFor="businessName">
                        Business / Distribution Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-text-muted pointer-events-none text-xl">
                          storefront
                        </span>
                        <input
                          id="businessName"
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Apex Consumer Supplies"
                          className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Work Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-sm text-body-sm font-medium text-text-secondary" htmlFor="workEmail">
                        Work Email Address
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-text-muted pointer-events-none text-xl">
                          mail
                        </span>
                        <input
                          id="workEmail"
                          type="email"
                          required
                          value={workEmail}
                          onChange={(e) => setWorkEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                        />
                      </div>
                    </div>

                    {/* Business Type Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-sm text-body-sm font-medium text-text-secondary" htmlFor="businessType">
                        Primary Business Model
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-text-muted pointer-events-none text-xl">
                          category
                        </span>
                        <select
                          id="businessType"
                          required
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full h-10 pl-10 pr-8 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select operation type</option>
                          <option value="fmcg">FMCG Distributor</option>
                          <option value="wholesaler">Wholesaler</option>
                          <option value="supermarket">Supermarket / Retailer</option>
                          <option value="other">Other Commercial Entity</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 text-text-muted pointer-events-none text-xl">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-sm text-body-sm font-medium text-text-secondary" htmlFor="passwordInput">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-text-muted pointer-events-none text-xl">
                          lock
                        </span>
                        <input
                          id="passwordInput"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full h-10 pl-10 pr-10 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-text-muted hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-sm text-body-sm font-medium text-text-secondary" htmlFor="confirmPasswordInput">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-text-muted pointer-events-none text-xl">
                          lock_reset
                        </span>
                        <input
                          id="confirmPasswordInput"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full h-10 pl-10 pr-10 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 text-text-muted hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  <div className="p-3 bg-surface-container-low rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-mono-sm text-label-mono-sm text-text-muted">Password Security</span>
                      <span className="font-label-mono-sm text-label-mono-sm font-semibold text-text-muted" id="strengthText">
                        {strength.text}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength.score >= 1 ? "bg-warning-amber" : "bg-outline-variant"
                        }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength.score >= 2 ? "bg-warning-amber" : "bg-outline-variant"
                        }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          strength.score >= 3 ? "bg-success-emerald" : "bg-outline-variant"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3 mt-1">
                    <input
                      id="termsAgreement"
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded cursor-pointer accent-primary-container focus:ring-primary-container"
                    />
                    <label className="font-body-sm text-body-sm text-text-secondary select-none" htmlFor="termsAgreement">
                      I agree to MyBilling's{" "}
                      <a className="text-primary hover:underline font-medium" href="#terms">
                        Terms of Service
                      </a>{" "}
                      and acknowledge the{" "}
                      <a className="text-primary hover:underline font-medium" href="#privacy">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>

                  {/* Submit CTA Button */}
                  <div className="mt-2 flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 px-6 rounded-lg bg-gradient-to-r from-primary-container via-secondary to-primary text-on-primary font-headline-sm text-headline-sm font-medium shadow-md hover:shadow-primary-container/30 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Setting up account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account &amp; Start Free Trial</span>
                          <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-center mt-1">
                      <span className="font-body-sm text-body-sm text-text-muted">Already have an account?</span>
                      <Link
                        to="/login"
                        className="font-body-sm text-body-sm font-semibold text-primary hover:text-secondary hover:underline transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </form>

                {/* Trust Badges Footer */}
                <div className="mt-8 pt-5 bg-surface-container-low/50 rounded-lg p-3 flex flex-wrap items-center justify-around gap-4 text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-success-emerald">verified_user</span>
                    <span className="font-label-mono-sm text-label-mono-sm">256-bit Bank Grade SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">cloud_done</span>
                    <span className="font-label-mono-sm text-label-mono-sm">99.98% SLA Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary">database</span>
                    <span className="font-label-mono-sm text-label-mono-sm">Encrypted Hourly Backups</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default SignupPage;