import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-margin pt-28 pb-16">
        {/* Breadcrumb / Category */}
        <div className="flex items-center gap-2 mb-4 text-xs font-medium text-text-muted">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-on-surface">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/40 border border-primary/20 text-primary text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            Educational & Demonstration Project
          </div>
          <h1 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Last Updated: November 2026 • Free Educational Project
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-on-surface-variant font-body-md text-sm md:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                1
              </span>
              About This Project
            </h2>
            <p>
              <strong>MyBilling</strong> is an independent, personal project developed strictly for 
              <strong> educational, technical showcase, and demonstration purposes</strong>. It is designed to illustrate 
              modern web architecture, ERP workflows, and FMCG distributor billing concepts.
            </p>
            <p className="mt-2 text-text-muted text-sm">
              This application is completely free to access and use. There are no paid plans, subscriptions, advertisements, 
              or commercial data monetization activities.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              Information We Collect & How It Is Used
            </h2>
            <p>
              When you use MyBilling, the application may collect minimal data strictly necessary to provide demo features:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>
                <strong>Account Credentials:</strong> If you register with an email and password, or sign in via Google OAuth, 
                we store your email address and display name solely to identify your session and isolate your workspace.
              </li>
              <li>
                <strong>Demo Business Data:</strong> Any products, shops, customers, inventory numbers, purchases, and invoices 
                you enter are stored solely to render your distributor dashboard and allow you to test the app's functionality.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                3
              </span>
              Google Sign-In & Third-Party Authentication
            </h2>
            <p>
              Users may optionally sign in using Google. Authentication is processed securely via Supabase Auth. 
              We only request standard public profile information (such as your verified email and name). We do not request 
              access to your Google Drive, contacts, emails, or any other personal Google data.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                4
              </span>
              Data Sharing & Protection
            </h2>
            <p>
              We <strong>do not sell, rent, trade, or intentionally misuse</strong> any user data or entered business records. 
              Your information is never shared with third-party advertisers or data brokers.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-sm">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">warning</span>
                Notice Regarding Sensitive Information:
              </p>
              <p className="text-xs leading-relaxed">
                Because MyBilling is a personal educational demo, please <strong>do not enter real-world confidential business records, 
                banking credentials, credit card numbers, or sensitive personal information</strong>. Please use sample, mock, 
                or dummy inventory data when exploring the application.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                5
              </span>
              Data Retention & Removal
            </h2>
            <p>
              As a demonstration environment, data stored on MyBilling may be periodically pruned, reset, or removed during 
              routine maintenance and software updates. If you would like your demonstration account or mock records removed, 
              you can reach out using the contact method below.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                6
              </span>
              Contact
            </h2>
            <p>
              If you have any questions, feedback, or data removal requests regarding this educational project, please contact 
              the developer through the project repository or via email:
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low border border-border-strong text-sm">
              <span className="material-symbols-outlined text-primary text-base">mail</span>
              <a 
                href="mailto:contact.mybilling@gmail.com" 
                className="text-primary font-medium hover:underline"
              >
                contact.mybilling@gmail.com
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPage;
