export function FeaturesSection() {
  return (
    <section className="w-full py-20 lg:py-28 px-margin bg-canvas-bg" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-accent-violet-light/20 via-primary/15 to-tertiary-container/15 text-primary border border-primary/30 font-label-mono-sm text-label-mono-sm font-bold shadow-sm mb-4">
            <span className="material-symbols-outlined text-[15px] text-primary">token</span>
            <span className="tracking-wide">ENTERPRISE ARCHITECTURE</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface tracking-tight">
            Everything Your Business Needs.
          </h2>
          <p className="font-body-lg text-body-lg text-text-muted mt-4">
            Engineered from the ground up to eliminate billing bottlenecks, eradicate reconciliation errors, and accelerate distributor cash flow.
          </p>
        </div>

        {/* 6 High-Fidelity Feature Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Smart Billing (Electric Indigo / Violet) */}
          <div className="feature-card group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-card via-surface-card to-primary/5 shadow-md hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 border-2 border-primary/30 hover:border-primary flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-bl from-primary/30 via-accent-violet-light/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent-violet-light text-on-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[28px]">receipt_long</span>
              </div>
              <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-2">
                Smart Instant Billing
              </h3>
              <p className="font-body-md text-body-md text-text-muted leading-relaxed">
                Create compliant GST/tax invoices in under 15 seconds. Built-in instant barcode scanner emulation, wholesale volume pricing tiers, and split taxation.
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-primary/10 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-mono-sm text-xs font-bold flex items-center gap-1 border border-primary/20">
                &lt;15s checkout speed
              </span>
              <span className="material-symbols-outlined text-primary group-hover:translate-x-1.5 transition-all text-[20px]">
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 2: FMCG SKU Catalog & Expiry (Warm Amber / Sunset Orange) */}
          <div className="feature-card group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-card via-surface-card to-warning-amber/5 shadow-md hover:shadow-2xl hover:shadow-warning-amber/20 hover:-translate-y-1 transition-all duration-300 border-2 border-warning-amber/40 hover:border-warning-amber flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-bl from-warning-amber/30 via-warning-amber/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-warning-amber via-warning-amber to-secondary text-white flex items-center justify-center mb-6 shadow-lg shadow-warning-amber/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[28px]">inventory</span>
              </div>
              <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-2">
                FMCG SKU Catalog &amp; Expiry
              </h3>
              <p className="font-body-md text-body-md text-text-muted leading-relaxed">
                Master complex FMCG inventory with batch numbers, manufacture &amp; expiry dates, MRP margin guards, and bulk units (crates, cartons, pieces).
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-warning-amber/15 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-warning-amber/15 text-warning-amber font-label-mono-sm text-xs font-bold flex items-center gap-1 border border-warning-amber/30">
                Batch &amp; MRP margin lock
              </span>
              <span className="material-symbols-outlined text-warning-amber group-hover:translate-x-1.5 transition-all text-[20px]">
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 3: Multi-Shop & Route CRM (Bright Cyan / Sky Blue) */}
          <div className="feature-card group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-card via-surface-card to-tertiary-fixed-dim/10 shadow-md hover:shadow-2xl hover:shadow-tertiary-fixed-dim/25 hover:-translate-y-1 transition-all duration-300 border-2 border-tertiary-fixed-dim/40 hover:border-tertiary-fixed-dim flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-bl from-tertiary-fixed-dim/35 via-tertiary-fixed-dim/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-tertiary-container to-tertiary-fixed-dim text-white flex items-center justify-center mb-6 shadow-lg shadow-tertiary-container/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[28px]">hub</span>
              </div>
              <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-2">
                Multi-Shop &amp; Route CRM
              </h3>
              <p className="font-body-md text-body-md text-text-muted leading-relaxed">
                Maintain shop-wise digital ledgers, outstanding balances, credit limits, and delivery beats. Instantly dispatch bills directly via automated WhatsApp.
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-tertiary-fixed-dim/20 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed-dim/20 text-tertiary font-label-mono-sm text-xs font-bold flex items-center gap-1 border border-tertiary-fixed-dim/30">
                WhatsApp 1-click ledger
              </span>
              <span className="material-symbols-outlined text-tertiary group-hover:translate-x-1.5 transition-all text-[20px]">
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 4: Thermal & A4 Dispatches (Fresh Emerald / Mint Green) */}
          <div className="feature-card group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-card via-surface-card to-success-emerald/5 shadow-md hover:shadow-2xl hover:shadow-success-emerald/20 hover:-translate-y-1 transition-all duration-300 border-2 border-success-emerald/40 hover:border-success-emerald flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-bl from-success-emerald/30 via-success-emerald/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-success-emerald to-tertiary-fixed-dim text-white flex items-center justify-center mb-6 shadow-lg shadow-success-emerald/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[28px]">print</span>
              </div>
              <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-2">
                Thermal &amp; A4 Dispatches
              </h3>
              <p className="font-body-md text-body-md text-text-muted leading-relaxed">
                Support 2-inch and 3-inch wireless thermal POS printers, laser A4/A5 invoices, digital e-way bills, and delivery challans with barcode scans.
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-success-emerald/15 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-success-emerald/10 text-success-emerald font-label-mono-sm text-xs font-bold flex items-center gap-1 border border-success-emerald/20">
                Thermal POS &amp; A4 ready
              </span>
              <span className="material-symbols-outlined text-success-emerald group-hover:translate-x-1.5 transition-all text-[20px]">
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 5: Live Profit Margins (Neon Rose / Magenta) */}
          <div className="feature-card group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-card via-surface-card to-error/5 shadow-md hover:shadow-2xl hover:shadow-error/20 hover:-translate-y-1 transition-all duration-300 border-2 border-error/30 hover:border-error flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-bl from-error/30 via-error/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-error to-secondary-container text-white flex items-center justify-center mb-6 shadow-lg shadow-error/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[28px]">trending_up</span>
              </div>
              <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-2">
                Live Profit Margins
              </h3>
              <p className="font-body-md text-body-md text-text-muted leading-relaxed">
                Know your real gross and net margin on every order. Filter by sales rep commissions, route profitability, product return rates, and supplier schemes.
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-error/15 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-error/10 text-error font-label-mono-sm text-xs font-bold flex items-center gap-1 border border-error/20">
                Per-item margin audits
              </span>
              <span className="material-symbols-outlined text-error group-hover:translate-x-1.5 transition-all text-[20px]">
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 6: Automated Reconciliation (Purple / Sunset Coral) */}
          <div className="feature-card group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-card via-surface-card to-secondary-container/10 shadow-md hover:shadow-2xl hover:shadow-secondary-container/20 hover:-translate-y-1 transition-all duration-300 border-2 border-secondary-container/30 hover:border-secondary-container flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-bl from-secondary-container/30 via-accent-violet-light/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary-container to-accent-violet-light text-white flex items-center justify-center mb-6 shadow-lg shadow-secondary-container/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
              </div>
              <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-2">
                Automated Reconciliation
              </h3>
              <p className="font-body-md text-body-md text-text-muted leading-relaxed">
                Eliminate daily manual cash tallying. Automatic reconciliation across cash deposits, UPI dynamic QR codes, cheques, and aging debt reminder sequences.
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-secondary-container/15 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-secondary-container/15 text-secondary-container font-label-mono-sm text-xs font-bold flex items-center gap-1 border border-secondary-container/30">
                Auto UPI &amp; cash balance
              </span>
              <span className="material-symbols-outlined text-secondary-container group-hover:translate-x-1.5 transition-all text-[20px]">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default FeaturesSection;