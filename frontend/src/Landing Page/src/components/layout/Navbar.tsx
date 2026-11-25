import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const location = useLocation();

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    if (location.pathname !== "/") return;
    const sectionIds = ["hero", "app-preview", "how-it-works", "features", "about"];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", href: "/#hero", id: "hero" },
    { label: "App Preview", href: "/#app-preview", id: "app-preview" },
    { label: "How It Works", href: "/#how-it-works", id: "how-it-works" },
    { label: "Features", href: "/#features", id: "features" },
    { label: "About", href: "/#about", id: "about" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-card/80 backdrop-blur-md border-b border-border-subtle transition-all duration-200">
      <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="flex items-center gap-space-sm group">
            <Logo className="h-8 w-auto object-contain" />
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors font-bold">
              MyBilling
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-space-lg">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id && location.pathname === "/";
              return (
                <a
                  key={link.id}
                  href={location.pathname === "/" && link.href.startsWith("/#") ? link.href.substring(1) : link.href}
                  className={`font-body-md transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-primary via-secondary to-accent-violet-light border border-white/20 hover:shadow-lg hover:shadow-primary/40 transition-all shadow-md group hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium tracking-wide">Explore Premium</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-white text-[9px] font-label-mono-sm font-bold tracking-wider uppercase backdrop-blur-sm">
                PRO
              </span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="hidden sm:flex items-center gap-space-sm">
            <Link
              to="/login"
              className="font-body-md text-body-md text-on-surface px-space-md py-space-xs rounded-lg border border-border-strong hover:bg-surface-container-low hover:text-on-surface transition-all"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="font-body-md text-body-md font-medium text-on-primary px-space-md py-space-xs rounded-lg bg-primary hover:bg-secondary transition-all shadow-[0_0_12px_rgba(79,70,229,0.35)]"
            >
              Get Started
            </Link>
          </div>
          <Link
            to="/login"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary"
            title="Profile"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </Link>
          <button
            type="button"
            aria-label="Toggle Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-space-xs text-on-surface-variant hover:text-on-surface focus:outline-none"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-subtle bg-surface-card/95 backdrop-blur-xl px-margin py-space-lg transition-all" id="mobile-drawer">
          <nav className="flex flex-col gap-space-md mb-space-lg">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={location.pathname === "/" && link.href.startsWith("/#") ? link.href.substring(1) : link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-body-md text-body-md transition-colors ${
                  activeSection === link.id && location.pathname === "/"
                    ? "text-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all shadow-sm group hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Explore Premium</span>
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[9px] font-label-mono-sm font-bold tracking-wider uppercase">
                PRO
              </span>
            </Link>
          </nav>
          <div className="flex flex-col gap-space-sm pt-space-md border-t border-border-subtle">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center font-body-md text-body-md text-on-surface py-space-xs rounded-lg border border-border-strong hover:bg-surface-container-low"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center font-body-md text-body-md font-medium text-on-primary py-space-xs rounded-lg bg-primary hover:bg-secondary transition-all shadow-[0_0_12px_rgba(79,70,229,0.35)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
export default Navbar;