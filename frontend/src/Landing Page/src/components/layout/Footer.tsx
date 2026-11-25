import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

export function Footer() {
  return (
    <footer className="w-full bg-surface-card border-t border-border-subtle pt-space-xl pb-space-lg">
      <div className="max-w-7xl mx-auto px-margin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-space-xl pb-space-xl">
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <Link to="/" className="flex items-center gap-space-sm group w-fit">
              <Logo className="h-8 w-auto object-contain" />
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors font-bold">
                MyBilling
              </span>
            </Link>
            <p className="font-body-md text-body-md text-text-muted max-w-sm leading-relaxed">
              Billing, inventory, and ledger operations engineered specifically for FMCG distributors and high-velocity commerce.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-border-strong text-text-muted w-fit mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning-amber shrink-0" />
              <span className="font-label-mono-sm text-[11px] font-medium text-text-secondary">
                Simulated metrics for demonstration purposes
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-mono-sm text-label-mono-sm uppercase text-text-muted">Product</h4>
            <ul className="flex flex-col gap-space-xs">
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#features">Features</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#app-preview">Interactive Preview</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <Link to="/pricing">Pricing</Link>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Integrations</a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-mono-sm text-label-mono-sm uppercase text-text-muted">Solutions</h4>
            <ul className="flex flex-col gap-space-xs">
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">FMCG Distributors</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Wholesalers</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Retail Suppliers</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Multi-shop</a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-mono-sm text-label-mono-sm uppercase text-text-muted">Resources</h4>
            <ul className="flex flex-col gap-space-xs">
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Documentation</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">API</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Status</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Changelog</a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-mono-sm text-label-mono-sm uppercase text-text-muted">Company</h4>
            <ul className="flex flex-col gap-space-xs">
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#about">About</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <a href="#">Careers</a>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                <Link to="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-space-lg border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <span className="font-body-sm text-body-sm text-text-muted">© 2026 MyBilling. Free educational demonstration project.</span>
          <div className="flex items-center gap-space-md">
            <span className="font-label-mono-sm text-label-mono-sm text-text-muted">v2.4.0-prod</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;