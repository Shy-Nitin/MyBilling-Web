export function HowItWorksSection() {
  return (
    <section className="w-full py-20 lg:py-28 px-margin bg-surface" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-secondary/15 via-primary/10 to-tertiary-fixed-dim/20 text-secondary border border-secondary/30 font-label-mono-sm text-label-mono-sm font-bold shadow-sm mb-4">
            <span className="material-symbols-outlined text-[15px] text-secondary">linear_scale</span>
            <span className="tracking-wide">HIGH-VELOCITY ONBOARDING</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface tracking-tight">
            From Products to Payments. Made Simple.
          </h2>
          <p className="font-body-lg text-body-lg text-text-muted mt-4">
            Go live in under 10 minutes without complicated ERP migrations or lengthy staff training sessions.
          </p>
        </div>

        {/* Stepper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1: Electric Indigo-Violet tint */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-surface-card via-surface-card to-primary/5 shadow-md hover:shadow-xl hover:shadow-primary/20 transition-all flex flex-col border-2 border-primary/30 hover:border-primary overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="font-display-hero text-headline-lg font-bold bg-gradient-to-r from-primary to-accent-violet-light bg-clip-text text-transparent">
                01
              </span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent-violet-light text-on-primary flex items-center justify-center font-bold shadow-md shadow-primary/30">
                <span className="material-symbols-outlined text-[24px]">upload_file</span>
              </div>
            </div>
            <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-3 relative z-10">
              Import Catalog &amp; Taxes
            </h3>
            <p className="font-body-md text-body-md text-text-muted leading-relaxed relative z-10">
              Upload your existing product sheets with a single CSV or sync from your legacy billing software. Pre-configured GST brackets and FMCG master catalogs are loaded instantly.
            </p>
            <div className="mt-6 pt-4 border-t border-primary/15 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-mono-sm text-xs font-bold border border-primary/20">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                Ready in 3 minutes
              </span>
            </div>
          </div>

          {/* Step 2: Sunset Amber-Coral tint */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-surface-card via-surface-card to-warning-amber/5 shadow-md hover:shadow-xl hover:shadow-warning-amber/20 transition-all flex flex-col border-2 border-warning-amber/40 hover:border-warning-amber overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-warning-amber/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="font-display-hero text-headline-lg font-bold bg-gradient-to-r from-warning-amber to-secondary bg-clip-text text-transparent">
                02
              </span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-warning-amber to-secondary text-white flex items-center justify-center font-bold shadow-md shadow-warning-amber/30">
                <span className="material-symbols-outlined text-[24px]">alt_route</span>
              </div>
            </div>
            <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-3 relative z-10">
              Map Shops &amp; Assign Beats
            </h3>
            <p className="font-body-md text-body-md text-text-muted leading-relaxed relative z-10">
              Group retail customer stores by daily delivery routes. Set customized credit limits, payment grace periods, and designate sales agents with assigned handheld tablets.
            </p>
            <div className="mt-6 pt-4 border-t border-warning-amber/15 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-amber/15 text-warning-amber font-label-mono-sm text-xs font-bold border border-warning-amber/30">
                <span className="material-symbols-outlined text-[15px]">pin_drop</span>
                Route optimization built-in
              </span>
            </div>
          </div>

          {/* Step 3: Emerald-Teal tint */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-b from-surface-card via-surface-card to-success-emerald/5 shadow-md hover:shadow-xl hover:shadow-success-emerald/20 transition-all flex flex-col border-2 border-success-emerald/40 hover:border-success-emerald overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-success-emerald/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="font-display-hero text-headline-lg font-bold bg-gradient-to-r from-success-emerald to-tertiary-fixed-dim bg-clip-text text-transparent">
                03
              </span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-success-emerald to-tertiary-container text-white flex items-center justify-center font-bold shadow-md shadow-success-emerald/30">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
            </div>
            <h3 className="font-headline-md text-headline-sm font-bold text-on-surface mb-3 relative z-10">
              Start Billing &amp; Track Profits
            </h3>
            <p className="font-body-md text-body-md text-text-muted leading-relaxed relative z-10">
              Generate digital &amp; thermal bills at store counters in seconds. Accept instant UPI payments or record credit notes, while watching gross profit margins refresh in real time.
            </p>
            <div className="mt-6 pt-4 border-t border-success-emerald/15 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-emerald/15 text-success-emerald font-label-mono-sm text-xs font-bold border border-success-emerald/30">
                <span className="material-symbols-outlined text-[15px]">auto_graph</span>
                Real-time P&amp;L stream
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HowItWorksSection;