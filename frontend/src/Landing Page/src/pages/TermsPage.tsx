import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Link } from "react-router-dom";

export function TermsPage() {
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
          <span className="text-on-surface">Terms of Service</span>
        </div>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-border-subtle">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/40 border border-primary/20 text-primary text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            Educational & Demonstration Project
          </div>
          <h1 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
            Terms of Service
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
              Nature of the Service
            </h2>
            <p>
              <strong>MyBilling</strong> is an experimental, non-commercial software project built solely for 
              <strong> educational and demonstration purposes</strong>. It showcases full-stack web development, 
              relational database design, and distributor billing workflows.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Access to MyBilling is entirely free of charge. No payment details, credit cards, or subscription agreements 
              are required or accepted.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              User Responsibilities & Acceptable Use
            </h2>
            <p>
              By accessing and using this demonstration application, you agree to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
              <li>Use the application strictly for lawful, personal, testing, or learning purposes.</li>
              <li>Not attempt to disrupt, breach, overload, or compromise the server or database infrastructure.</li>
              <li>Not input malicious code, illegal materials, or unauthorized third-party information.</li>
              <li>Take personal responsibility for any sample or business data you enter into the platform.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                3
              </span>
              "As-Is" Demonstration Disclaimer
            </h2>
            <p>
              MyBilling is provided on an <strong>"as-is" and "as-available"</strong> basis without warranties of any kind, 
              whether express or implied.
            </p>
            <p className="mt-2 text-sm">
              Because this is a demonstration environment:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-text-muted">
              <li>We do not guarantee uninterrupted uptime, 24/7 availability, or bug-free operation.</li>
              <li>We do not guarantee permanent data storage or archival; data may be reset during updates.</li>
              <li>Calculations, invoices, and reports generated are for educational demonstration and should not be relied upon as certified legal or tax accounting documents.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                4
              </span>
              Modifications & Discontinuation
            </h2>
            <p>
              The developer reserves the right to modify, update, pause, or discontinue any aspect of the demonstration project 
              at any time without prior notice or liability.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                5
              </span>
              Limitation of Liability
            </h2>
            <p>
              In no event shall the developer of this educational project be liable for any direct, indirect, incidental, 
              or consequential damages resulting from the use or inability to use this demonstration website.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-surface-card p-6 md:p-8 rounded-2xl border border-border-subtle shadow-sm">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-surface-container-low text-primary flex items-center justify-center text-xs font-mono font-bold">
                6
              </span>
              Questions & Contact
            </h2>
            <p>
              For inquiries, feedback, or technical questions concerning these terms and the MyBilling educational demo, 
              please reach out at:
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

export default TermsPage;
