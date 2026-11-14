import { Link } from "react-router-dom";

export function CtaBanner() {
  return (
    <section className="w-full py-16 lg:py-24 px-margin bg-canvas-bg">
      <div className="max-w-5xl mx-auto relative rounded-3xl bg-gradient-to-r from-primary via-secondary to-tertiary-container p-8 sm:p-12 lg:p-16 text-center text-on-primary shadow-2xl overflow-hidden border-2 border-white/30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-violet-light/40 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-tertiary-fixed-dim/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-secondary-container/30 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md font-label-mono-sm text-label-mono-sm font-bold mb-6 border border-white/30 shadow-md text-white">
            <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">rocket_launch</span>
            <span className="tracking-wide">LAUNCH TODAY IN MINUTES</span>
          </div>

          <h2 className="font-display-hero text-headline-lg-mobile sm:text-headline-lg lg:text-display-hero text-white font-bold tracking-tight leading-tight drop-shadow-sm">
            Ready to Simplify Your Billing?
          </h2>

          <p className="font-body-lg text-body-lg text-white/90 mt-5 max-w-xl text-balance leading-relaxed">
            Join 1,200+ distributors and retailers managing over $42M in monthly transactions. Experience peak operational velocity today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto">
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-primary font-headline-sm text-headline-sm font-bold shadow-2xl hover:bg-surface-bright hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95"
            >
              <span>Create Your Free Account</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1.5 transition-transform text-primary">
                arrow_forward
              </span>
            </Link>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-headline-sm text-headline-sm font-semibold backdrop-blur-md transition-all border border-white/30 shadow-lg hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">calendar_month</span>
              <span>Schedule a 15-Min Demo</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/25 font-label-mono-sm text-xs text-white/90">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-success-emerald">check_circle</span>
              No credit card required
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
              14-day full feature trial
            </span>
            <span className="hidden sm:inline text-white/40">•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-accent-violet-light">check_circle</span>
              Instant catalog CSV setup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
export default CtaBanner;