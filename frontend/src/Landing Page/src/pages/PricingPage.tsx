import { useState } from "react";
import { Link } from "react-router-dom";
import { SmartChatbot } from "../components/bot/SmartChatbot";
import { Logo } from "@/components/common/Logo";
import { SOCIAL_LINKS } from "@/config/socialLinks";

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [selectedPlan, setSelectedPlan] = useState<string>("Free");
  const [modalOpen, setModalOpen] = useState(false);

  const prices = {
    USD: {
      monthly: { free: "$0", plus: "$10", max: "$50" },
      annual: { free: "$0", plus: "$8", max: "$40" },
      notePlus: "billed annually ($96/yr)",
      noteMax: "billed annually ($480/yr)",
    },
    INR: {
      monthly: { free: "₹0", plus: "₹799", max: "₹3,999" },
      annual: { free: "₹0", plus: "₹640", max: "₹3,200" },
      notePlus: "billed annually (₹7,680/yr)",
      noteMax: "billed annually (₹38,400/yr)",
    },
  };

  const currPricing = prices[currency][billingCycle];
  const notes = prices[currency];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setModalOpen(true);
  };

  return (
    <div className="bg-grid-pattern text-slate-200 min-h-screen font-sans antialiased selection:bg-white/20 selection:text-white flex flex-col justify-between">
      {/* BEGIN: SiteNavigation */}
      <header className="w-full border-b border-white/[0.06] bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo className="w-8 h-8 rounded-lg shadow-lg shadow-indigo-500/20" />
            <span className="text-white font-bold tracking-tight text-lg">MyBilling</span>
          </Link>

          {/* Right Navigation Action */}
          <nav>
            <Link
              to="/"
              className="text-xs uppercase tracking-wider font-semibold text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              <span>Back to Home</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* BEGIN: MainContent */}
      <main className="flex-grow flex flex-col justify-center py-12 md:py-16">
        <div className="max-w-[1020px] w-full mx-auto px-6">
          {/* BEGIN: HeroSectionHeader */}
          <section aria-labelledby="section-heading" className="mb-10 text-left">
            <h1 className="text-3xl md:text-[40px] font-extrabold text-white tracking-tight leading-tight mb-4" id="section-heading">
              How MyBilling Powers Your Growth&reg;
            </h1>
            <div className="text-[15px] md:text-base text-zinc-400 font-normal leading-relaxed space-y-1 max-w-2xl">
              <p>From lightning-fast counter billing to automated distributor ledgers, select the plan engineered for your scale.</p>
            </div>
          </section>

          {/* BEGIN: CardsGrid */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            {/* Billing frequency toggle */}
            <div
              aria-label="Billing frequency"
              className="inline-flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md relative"
              id="billing-toggle-container"
              role="group"
            >
              <button
                type="button"
                aria-pressed={billingCycle === "monthly"}
                onClick={() => setBillingCycle("monthly")}
                className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                id="toggle-monthly"
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={billingCycle === "annual"}
                onClick={() => setBillingCycle("annual")}
                className={`relative z-10 px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                id="toggle-annual"
              >
                <span>Annual</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            {/* Currency selection */}
            <div
              aria-label="Currency selection"
              className="inline-flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md relative"
              id="currency-toggle-container"
              role="group"
            >
              <button
                type="button"
                aria-pressed={currency === "USD"}
                onClick={() => setCurrency("USD")}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  currency === "USD"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                id="toggle-curr-usd"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>$ USD</span>
              </button>
              <button
                type="button"
                aria-pressed={currency === "INR"}
                onClick={() => setCurrency("INR")}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  currency === "INR"
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                id="toggle-curr-inr"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>₹ INR</span>
              </button>
            </div>
          </div>

          <section aria-label="Key Pillars" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* CARD 1 — FREE (Emerald Glow) */}
            <article
              className="feature-card rounded-[28px] p-7 flex flex-col justify-between overflow-hidden group cursor-pointer relative border border-emerald-500/30"
              data-purpose="plan-free"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[28px] glow-green"
              />
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">Starter</div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Free</h2>
                  <div className="mt-2 mb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-white tracking-tight" id="price-free">
                        {currPricing.free}
                      </span>
                      <span className="text-sm text-zinc-400 font-normal">/ forever</span>
                    </div>
                    <div className="text-[11px] h-4 text-transparent select-none">free forever</div>
                  </div>
                  <p className="text-[13px] text-zinc-300 leading-snug font-normal">
                    Perfect for getting started with MyBilling.
                  </p>
                </div>
                <div className="w-full h-px bg-white/[0.06] mb-5" />
                <ul className="space-y-2.5 text-xs text-zinc-300 flex-grow mb-6">
                  {[
                    "Basic billing & invoice creation",
                    "Up to 50 invoices per month",
                    "Basic product management",
                    "Shop and customer management",
                    "Basic sales overview",
                    "Standard PDF invoice export",
                    "Manual payment tracking",
                    "Standard support",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-200 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectPlan("Free")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-emerald-200 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors duration-200 flex items-center justify-center gap-1.5"
                >
                  Get Started Free
                </button>
              </div>
            </article>

            {/* CARD 2 — PLUS (Blue Glow + Most Popular) */}
            <article
              className="feature-card rounded-[28px] p-7 flex flex-col justify-between overflow-hidden group cursor-pointer relative border border-blue-500/30"
              data-purpose="plan-plus"
            >
              <div
                aria-hidden="true"
                className="glow-blue absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[28px]"
              />
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">Growth</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-blue-950/40 border border-blue-500/30 text-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Most Popular
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Plus</h2>
                  <div className="mt-2 mb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-white tracking-tight" id="price-plus">
                        {currPricing.plus}
                      </span>
                      <span className="text-sm text-zinc-400 font-normal">/ month</span>
                    </div>
                    <div
                      className={`text-[11px] text-blue-300 font-medium h-4 transition-opacity duration-200 ${
                        billingCycle === "annual" ? "opacity-100" : "opacity-0"
                      }`}
                      id="note-plus"
                    >
                      {notes.notePlus}
                    </div>
                  </div>
                  <p className="text-[13px] text-zinc-300 leading-snug font-normal">
                    For growing businesses that need more control.
                  </p>
                </div>
                <div className="w-full h-px bg-white/[0.06] mb-5" />
                <ul className="space-y-2.5 text-xs text-zinc-300 flex-grow mb-6">
                  <li className="flex items-center gap-2 font-medium text-white">
                    <svg className="w-4 h-4 text-blue-200 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                    </svg>
                    <span>Everything in Free</span>
                  </li>
                  {[
                    "Unlimited invoices",
                    "Advanced product management",
                    "Complete invoice editing",
                    "Advanced sales and profit analytics",
                    "Shop-wise purchase & sales history",
                    "PDF customization and sharing",
                    "Advanced payment & udhaar tracking",
                    "Data export and business reports",
                    "Priority support",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-200 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectPlan("Plus")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-tr from-blue-600 to-indigo-500 hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  Upgrade to Plus
                </button>
              </div>
            </article>

            {/* CARD 3 — MAX (Orange / Amber Glow) */}
            <article
              className="feature-card rounded-[28px] p-7 flex flex-col justify-between overflow-hidden group cursor-pointer relative border border-white/[0.06]"
              data-purpose="plan-max"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[28px] glow-orange"
              />
              <div className="relative z-10 flex flex-col flex-grow">
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-amber-200">
                      Enterprise Scale
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Max</h2>
                  <div className="mt-2 mb-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-white tracking-tight" id="price-max">
                        {currPricing.max}
                      </span>
                      <span className="text-sm text-zinc-400 font-normal">/ month</span>
                    </div>
                    <div
                      className={`text-[11px] font-medium h-4 transition-opacity duration-200 text-amber-200 ${
                        billingCycle === "annual" ? "opacity-100" : "opacity-0"
                      }`}
                      id="note-max"
                    >
                      {notes.noteMax}
                    </div>
                  </div>
                  <p className="text-[13px] text-zinc-300 leading-snug font-normal">
                    Maximum control. Maximum business intelligence.
                  </p>
                </div>
                <div className="w-full h-px bg-white/[0.06] mb-5" />
                <ul className="space-y-2.5 text-xs text-zinc-300 flex-grow mb-6">
                  <li className="flex items-center gap-2 font-medium text-white">
                    <svg className="w-4 h-4 text-amber-200 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                    </svg>
                    <span>Everything in Plus</span>
                  </li>
                  {[
                    "Advanced inventory & stock management",
                    "Purchase & supplier management",
                    "Automated business insights",
                    "Advanced profit & performance reports",
                    "Multi-user access & team management",
                    "Automated data backup",
                    "Exclusive premium features",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-200 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative z-10 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectPlan("Max")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-colors duration-200 flex items-center justify-center gap-1.5"
                >
                  Go Max
                </button>
              </div>
            </article>
          </section>

          {/* BEGIN: ValuePropositionRow */}
          <footer className="pt-2">
            <ul className="flex flex-wrap items-center gap-6 md:gap-8 text-xs md:text-[13px] font-medium text-zinc-400">
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-zinc-300">Lightning Fast Billing</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" strokeWidth="2" />
                  <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m13 0a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span className="text-zinc-300">100% FMCG &amp; GST Ready</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
                </svg>
                <span className="text-zinc-300">Zero Reconciliation Errors</span>
              </li>
            </ul>
          </footer>
        </div>
      </main>

      {/* BEGIN: PageFooter */}
      <footer className="w-full border-t border-white/[0.04] py-6 text-center text-xs text-zinc-600">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600 font-normal">&copy; 2025 MyBilling Inc. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.mailTo}
              aria-label="Email"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] hover:border-white/20 text-zinc-400 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#141418] border border-white/10 p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Confirm {selectedPlan} Tier
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              You selected the {selectedPlan} plan on {billingCycle} billing ({currency}). Instant 14-day access activated.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <Link
                to="/signup"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}

      <SmartChatbot />
    </div>
  );
}
export default PricingPage;