import { useState, useRef, MouseEvent } from "react";
import { Link } from "react-router-dom";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / rect.height) * -8,
      y: (x / rect.width) * 8,
    });
    setFloatOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setFloatOffset({ x: 0, y: 0 });
  };

  return (
    <section
      className="relative w-full pt-12 pb-24 lg:pt-16 lg:pb-32 px-margin overflow-hidden bg-gradient-to-b from-surface via-surface to-canvas-bg"
      id="hero"
    >
      <div
        className="absolute -top-16 -right-16 w-[550px] h-[450px] bg-gradient-to-bl from-accent-violet-light/30 via-primary/20 to-tertiary-fixed-dim/20 blur-[130px] rounded-full pointer-events-none -z-10"
        id="parallax-orb-1"
      />
      <div
        className="absolute top-1/2 -left-32 w-[500px] h-[400px] bg-gradient-to-tr from-success-emerald/15 via-tertiary-fixed-dim/20 to-primary/10 blur-[130px] rounded-full pointer-events-none -z-10"
        id="parallax-orb-2"
      />
      <div
        className="absolute -top-24 left-1/4 w-[500px] h-[350px] bg-gradient-to-br from-tertiary-fixed-dim/20 via-accent-violet-light/20 to-transparent blur-[120px] rounded-full pointer-events-none -z-10"
        id="parallax-orb-3"
      />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-gradient-to-tr from-warning-amber/15 via-secondary/15 to-transparent blur-[110px] rounded-full pointer-events-none -z-10" />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-br from-primary/10 via-secondary-container/10 to-tertiary-fixed-dim/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-accent-violet-light/10 blur-[110px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-tertiary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-surface-card shadow-sm hover:shadow-md transition-all duration-300 mb-6 group cursor-pointer border border-tertiary-fixed-dim/30 hover:border-primary/40 relative">
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-tertiary-fixed-dim/20 via-primary/10 to-accent-violet-light/20 blur-[2px] opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-label-mono-sm text-label-mono-sm font-semibold text-text-secondary tracking-tight relative z-10">
            Next-Gen FMCG &amp; SMB Billing Platform • v2.4 Live
          </span>
          <span className="material-symbols-outlined text-[14px] text-tertiary-container group-hover:translate-x-0.5 transition-transform duration-200 relative z-10">
            arrow_forward
          </span>
        </div>

        {/* Main Title */}
        <h1 className="font-display-hero text-headline-lg-mobile sm:text-headline-lg lg:text-display-hero text-on-surface font-bold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Billing Your Business.{" "}
          <span className="block sm:inline bg-gradient-to-r from-primary via-secondary to-tertiary-container bg-clip-text text-transparent">
            Simplified.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="font-body-lg text-body-lg text-text-muted max-w-2xl mx-auto mt-6 text-balance">
          Manage products, invoices, shops, sales, and profits — all from one unified operating system engineered specifically for high-velocity distributors and growing retailers.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md mt-8 w-full sm:w-auto">
          <Link
            to="/signup"
            className="group relative inline-flex items-center justify-center gap-space-sm w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:bg-secondary active:scale-[0.98] transition-all duration-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started Free
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </Link>
          <a
            href="#app-preview"
            className="inline-flex items-center justify-center gap-space-sm w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-card text-on-surface font-headline-sm text-headline-sm font-semibold shadow-sm hover:shadow-md hover:bg-surface-container-low transition-all duration-200 border border-border-strong"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
            Explore Live Demo
          </a>
        </div>

        {/* Trust Badges & Metrics Strip */}
        <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-10 mt-10 pt-4 text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="flex text-warning-amber">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
            </div>
            <span className="font-label-mono-sm text-label-mono-sm font-semibold text-text-secondary">
              4.9/5 from 1,200+ FMCG Distributors
            </span>
          </div>
          <div className="hidden sm:block text-outline-variant">•</div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-success-emerald text-[18px]">verified</span>
            <span className="font-label-mono-sm text-label-mono-sm font-semibold text-text-secondary">
              Zero Setup Fees
            </span>
          </div>
          <div className="hidden sm:block text-outline-variant">•</div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
            <span className="font-label-mono-sm text-label-mono-sm font-semibold text-text-secondary">
              99.99% Uptime SLA
            </span>
          </div>
        </div>

        {/* Brand Logos Bar Marquee */}
        <div className="w-full max-w-5xl mt-10 pt-4 overflow-hidden relative group">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface to-transparent z-10" />
          <div className="distributor-marquee-track items-center gap-12 text-on-surface-variant opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-12">
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-secondary text-[24px]">inventory_2</span> FMCG Prime
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-tertiary text-[24px]">storefront</span> Metro Wholesale
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span> Apex Logistics
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-success-emerald text-[24px]">store</span> Reliance Retailers
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-warning-amber text-[24px]">local_mall</span> SuperBazaar Group
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-tertiary-container text-[24px]">share_location</span> Bharat Supply Chain
              </span>
            </div>
            <div className="flex items-center gap-12">
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-secondary text-[24px]">inventory_2</span> FMCG Prime
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-tertiary text-[24px]">storefront</span> Metro Wholesale
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span> Apex Logistics
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-success-emerald text-[24px]">store</span> Reliance Retailers
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-warning-amber text-[24px]">local_mall</span> SuperBazaar Group
              </span>
              <span className="font-headline-sm font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-tertiary-container text-[24px]">share_location</span> Bharat Supply Chain
              </span>
            </div>
          </div>
        </div>

        {/* 3D Perspective Hero Mockup Visual */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-5xl mt-12 lg:mt-16 perspective-container group"
          id="hero-perspective-wrap"
        >
          {/* Glowing Backdrop behind Mockup */}
          <div className="absolute -inset-3 bg-gradient-to-r from-tertiary-fixed-dim/30 via-primary/30 to-accent-violet-light/30 rounded-3xl blur-3xl opacity-75 group-hover:opacity-100 transition duration-700" />

          {/* Main Dashboard Window Shell */}
          <div
            className="relative rounded-2xl bg-surface-card/95 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8 text-left transition-transform duration-500 ease-out border border-border-strong/60"
            id="hero-tilt-card"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            {/* Mockup Window Titlebar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-error/70" />
                <span className="w-3 h-3 rounded-full bg-warning-amber/70" />
                <span className="w-3 h-3 rounded-full bg-success-emerald/70" />
                <span className="ml-2 font-label-mono-sm text-label-mono-sm text-text-muted">
                  app.mybilling.io/distributor-hub
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-success-emerald/10 text-success-emerald font-label-mono-sm text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse" /> SYNC ACTIVE
                </span>
                <span className="text-text-muted font-label-mono-sm text-xs">Today, 14:48</span>
              </div>
            </div>

            {/* Top 4 KPI Metrics Inside Mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Metric 1: Total Sales */}
              <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body-sm text-body-sm text-text-muted">Total Sales</span>
                  <span className="px-2 py-0.5 rounded-full bg-success-emerald/10 text-success-emerald font-label-mono-sm text-[11px] font-semibold">
                    +24.8%
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-on-surface font-bold font-display-hero tracking-tight">
                  $148,920.00
                </div>
                <div className="mt-2 flex items-center justify-between text-text-muted font-label-mono-sm text-xs">
                  <span>vs last month</span>
                  <svg className="w-16 h-5 text-success-emerald" fill="none" viewBox="0 0 60 20">
                    <path
                      d="M1 17L12 13L24 16L36 9L48 11L59 2"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Metric 2: Invoices */}
              <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body-sm text-body-sm text-text-muted">Invoices Settled</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-mono-sm text-[11px] font-semibold">
                    98.4% rate
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  1,420 Paid
                </div>
                <div className="mt-2 text-text-muted font-label-mono-sm text-xs">
                  8 pending verification
                </div>
              </div>

              {/* Metric 3: Active SKUs */}
              <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body-sm text-body-sm text-text-muted">Active SKUs</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-surface font-label-mono-sm text-[11px] font-semibold">
                    Live Sync
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  3,850 Products
                </div>
                <div className="mt-2 text-text-muted font-label-mono-sm text-xs">
                  Across 62 FMCG categories
                </div>
              </div>

              {/* Metric 4: Net Profit */}
              <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body-sm text-body-sm text-text-muted">Net Gross Profit</span>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-mono-sm text-[11px] font-semibold">
                    25.8% Margin
                  </span>
                </div>
                <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  $38,420.50
                </div>
                <div className="mt-2 text-text-muted font-label-mono-sm text-xs">
                  Real-time ledger audit
                </div>
              </div>
            </div>

            {/* Mockup Live Dispatch Feed Strip */}
            <div className="p-4 rounded-xl bg-canvas-bg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                </div>
                <div>
                  <p className="font-headline-sm text-body-md font-semibold text-on-surface">
                    Route North #4: 28 Delivery Dispatches Active
                  </p>
                  <p className="font-body-sm text-body-sm text-text-muted">
                    Driver: Samuel Miller • Van #KA-05-9921 • 92% delivered
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                <span className="font-label-mono-sm text-xs px-3 py-1 rounded-md bg-surface-card text-on-surface font-medium shadow-sm">
                  Next Stop: Metro Mart (4 min)
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-md bg-primary text-on-primary font-label-mono-sm text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  Track Van
                </button>
              </div>
            </div>
          </div>

          {/* Floating Micro-Card 1: Invoice Paid */}
          <div
            className="absolute -top-6 -left-4 sm:-left-8 p-3.5 rounded-xl bg-surface-card shadow-xl flex items-center gap-3 border border-border-strong/80 transition-transform duration-300 pointer-events-none sm:pointer-events-auto"
            id="float-badge-1"
            style={{
              transform: `translate(${floatOffset.x * 0.04}px, ${floatOffset.y * 0.04}px)`,
            }}
          >
            <div className="w-9 h-9 rounded-full bg-success-emerald/15 text-success-emerald flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <div className="text-left">
              <div className="font-headline-sm text-body-sm font-semibold text-on-surface">
                Invoice #INV-2025-089 paid
              </div>
              <div className="font-label-mono-sm text-body-sm text-success-emerald font-semibold">
                $3,450.00 just received • Instant UPI
              </div>
            </div>
          </div>

          {/* Floating Micro-Card 2: Low Stock Warning */}
          <div
            className="absolute -bottom-6 -right-2 sm:-right-6 p-3.5 rounded-xl bg-surface-card shadow-xl flex items-center gap-3 border border-border-strong/80 transition-transform duration-300 pointer-events-none sm:pointer-events-auto"
            id="float-badge-2"
            style={{
              transform: `translate(${floatOffset.x * -0.05}px, ${floatOffset.y * -0.05}px)`,
            }}
          >
            <div className="w-9 h-9 rounded-full bg-warning-amber/15 text-warning-amber flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div className="text-left">
              <div className="font-headline-sm text-body-sm font-semibold text-on-surface">
                Low Stock Alert
              </div>
              <div className="font-label-mono-sm text-body-sm text-text-muted">
                Unilever Dove Soap 100g (14 cases remaining)
              </div>
            </div>
          </div>

          {/* Floating Micro-Card 3: Shop Credit Limit */}
          <div
            className="hidden md:flex absolute top-1/2 -right-8 -translate-y-1/2 p-3 rounded-xl bg-surface-card shadow-xl items-center gap-3 border border-border-strong/80 transition-transform duration-300"
            id="float-badge-3"
            style={{
              transform: `translate(${floatOffset.x * 0.03}px, ${floatOffset.y * 0.03}px)`,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="text-left">
              <div className="font-label-mono-sm text-body-sm font-semibold text-on-surface">
                Metro Supermart
              </div>
              <div className="font-label-mono-sm text-[11px] text-success-emerald font-medium">
                Credit Limit: $15,000 • 100% Healthy
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HeroSection;