export function AboutSection() {
  return (
    <section className="w-full py-20 lg:py-28 px-margin bg-surface" id="about">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Story & Operational Metrics */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/15 via-secondary/15 to-accent-violet-light/20 text-primary border border-primary/30 font-label-mono-sm text-label-mono-sm font-bold shadow-sm mb-4 w-fit">
              <span className="material-symbols-outlined text-[15px] text-primary">flag</span>
              <span className="tracking-wide">OUR ORIGIN STORY</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface tracking-tight leading-tight">
              Built to Make Business Management Truly Frictionless.
            </h2>
            <p className="font-body-lg text-body-lg text-text-muted mt-5 leading-relaxed">
              MyBilling was created by former FMCG regional operators who spent years dealing with torn paper invoice books, expired stock write-offs, and delayed distributor payments.
            </p>
            <p className="font-body-md text-body-md text-text-muted mt-3 leading-relaxed">
              We built what we wished existed: an agile, crash-proof cloud terminal that combines high-speed counter checkout with intelligent inventory safeguards and automated ledger reconciliation.
            </p>

            {/* 3 Highlight Counters */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border-subtle">
              <div>
                <div className="font-display-hero text-headline-lg font-bold bg-gradient-to-r from-primary to-accent-violet-light bg-clip-text text-transparent stat-counter">
                  99.8%
                </div>
                <div className="font-body-sm text-text-muted mt-1 font-medium">Billing Accuracy</div>
              </div>
              <div>
                <div className="font-display-hero text-headline-lg font-bold bg-gradient-to-r from-secondary to-tertiary-fixed-dim bg-clip-text text-transparent stat-counter">
                  4.2x
                </div>
                <div className="font-body-sm text-text-muted mt-1 font-medium">Faster Checkout</div>
              </div>
              <div>
                <div className="font-display-hero text-headline-lg font-bold bg-gradient-to-r from-success-emerald to-tertiary-container bg-clip-text text-transparent stat-counter">
                  $42M+
                </div>
                <div className="font-body-sm text-text-muted mt-1 font-medium">Monthly Flow</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Benchmark Comparison Card */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-card shadow-xl border-2 border-primary/20 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-bl from-primary/15 via-secondary/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle relative z-10">
                <span className="font-headline-sm text-body-md font-bold text-on-surface flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  Distributor Transformation Benchmark
                </span>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-label-mono-sm text-[11px] font-bold shadow-sm">
                  VERIFIED STUDY
                </span>
              </div>
              <div className="space-y-4 relative z-10">
                {/* Item 1 */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle hover:border-success-emerald/40 transition-colors flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs font-label-mono-sm">
                    <span className="px-2 py-0.5 rounded bg-error/10 text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">close</span> Legacy Paper Bills
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-success-emerald/15 text-success-emerald font-bold flex items-center gap-1 border border-success-emerald/30">
                      <span className="material-symbols-outlined text-[14px]">check</span> With MyBilling
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-muted line-through font-medium">4 to 6 minutes per invoice</span>
                    <span className="text-success-emerald font-bold font-label-mono-sm text-xs bg-success-emerald/10 px-2 py-0.5 rounded">
                      &lt; 15 seconds barcode generation
                    </span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle hover:border-primary/40 transition-colors flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs font-label-mono-sm">
                    <span className="px-2 py-0.5 rounded bg-error/10 text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">close</span> End-of-Day Ledger
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold flex items-center gap-1 border border-primary/30">
                      <span className="material-symbols-outlined text-[14px]">check</span> With MyBilling
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-muted line-through font-medium">2+ hours manual calculation</span>
                    <span className="text-primary font-bold font-label-mono-sm text-xs bg-primary/10 px-2 py-0.5 rounded">
                      Instant automated reconciliation
                    </span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle hover:border-tertiary-fixed-dim/60 transition-colors flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs font-label-mono-sm">
                    <span className="px-2 py-0.5 rounded bg-error/10 text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">close</span> Payment Collections
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-bold flex items-center gap-1 border border-tertiary-container/30">
                      <span className="material-symbols-outlined text-[14px]">check</span> With MyBilling
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-muted line-through font-medium">35-day average debt cycle</span>
                    <span className="text-tertiary font-bold font-label-mono-sm text-xs bg-tertiary-container/15 px-2 py-0.5 rounded">
                      12-day turnaround with WhatsApp links
                    </span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle hover:border-warning-amber/40 transition-colors flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs font-label-mono-sm">
                    <span className="px-2 py-0.5 rounded bg-error/10 text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">close</span> Stock Expiry Losses
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-warning-amber/15 text-warning-amber font-bold flex items-center gap-1 border border-warning-amber/30">
                      <span className="material-symbols-outlined text-[14px]">check</span> With MyBilling
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-muted line-through font-medium">3.8% inventory dump</span>
                    <span className="text-warning-amber font-bold font-label-mono-sm text-xs bg-warning-amber/15 px-2 py-0.5 rounded">
                      Near 0% with auto batch alarms
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Testimonial Snippet inside card */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-primary/20 flex items-start gap-3 relative z-10">
                <span className="material-symbols-outlined text-primary text-[24px]">format_quote</span>
                <p className="font-body-sm text-xs text-text-secondary italic">
                  “Switching to MyBilling eliminated over 40 hours of monthly administrative overhead for our 3 warehouses. We collect outstanding balances 2 weeks earlier now.”
                  <span className="block mt-1 font-semibold not-italic text-on-surface">
                    — David Vance, Managing Director, Apex Distribution
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default AboutSection;