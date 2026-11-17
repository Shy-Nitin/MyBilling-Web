# MyBilling — Modern FMCG & Wholesale Distribution ERP

A complete, full-stack, enterprise-grade ERP and POS system engineered for wholesale distributors and high-velocity retail counters, featuring an integrated conversion landing page, secure multi-tenant isolation, 30-day persistent sessions, and automated double-entry accounting.

---

## 🌟 Executive Highlights

1. **Integrated Conversion Landing Page (`/`)**:
   - Modern, high-conversion landing page with real-time interactive receipt simulation.
   - Interactive demo billing terminal running entirely client-side/in-memory (no database pollution).
   - Dedicated pricing page (`/pricing`) opening in separate tabs with direct developer social connects.
   - Unified single-page application routing (`react-router-dom`).

2. **Enterprise Authentication & 30-Day Persistent Sessions**:
   - Secure registration and login with Bcrypt password hashing (`cost=12`).
   - Dual-token architecture: Short-lived in-memory JWT access tokens (15 mins) and cryptographically secure HttpOnly refresh cookies (`SameSite=Lax`).
   - Seamless session recovery: Survives tab close, browser restarts, and machine reboots without prompting for credentials.
   - Refresh token rotation & automatic family revocation upon replay detection.
   - Absolute session cap (90 days) and inactivity timeout (30 days).

3. **Multi-Tenant User Isolation & IDOR Protection**:
   - Every merchant workspace is strictly isolated via `user_id` foreign key relations.
   - Row-level access control enforced at the service and repository layers.
   - Identity derived strictly from cryptographically validated backend JWT claims (never trusts client headers or URL IDs).
   - Strict IDOR defense across products, invoices, customers, suppliers, ledgers, routes, and financial reports.

4. **Master Admin & Full Database Disaster Recovery**:
   - Explicit `master_admin` role separated from regular tenant accounts.
   - CLI provisioning tool (`python -m backend.app.db.provision_admin`).
   - System-wide atomic JSON database backup export and restoration with foreign key ordering and transaction rollback.

5. **Dual-Pane Billing Terminal (`/billing`)**:
   - Realtime catalog search by barcode/SKU with category filtering.
   - Live editable line items (selling price overrides, discount %, quantity steppers).
   - 4-way payment selector: Cash `[F2]`, UPI QR, Udhar Credit, Split Pay `[F4]`.
   - Realtime stock decrement & double-entry journal posting.
   - Generated ReportLab PDF invoice printing & WhatsApp bill sharing.

6. **Products & Inventory (`/inventory`, `/products`)**:
   - Wholesale vs landed cost inventory valuation tracking.
   - Color-coded stock level progress bars (Safe, Moderate, Low, Depleted).
   - Sticky bulk selection toolstrip (`[F6]` Barcode labels, `[Alt+U]` Bulk price update).
   - Comprehensive Add Product modal with automatic SKU generator.

7. **Shops & Udhar Ledger (`/shops`)**:
   - Registered credit clients with authorized credit limits and risk gauges.
   - Quick Udhar debt collection modal with instant journal entries.

8. **Purchases & Suppliers (`/purchases`)**:
   - Inward Goods Receipt Notes (GRN) with itemized tax and stock incrementing.
   - Vendor directory with payment credit terms.
   - Record Supplier Payment remittance modal with UTR tracking.

9. **Double-Entry General Ledger (`/ledger`)**:
   - Automated accounting stream for cash, bank, receivables, and payables.
   - Till drawer cash balance vs operating bank balance reconciliation.
   - Manual voucher entry for operational expenses and deposits.

10. **Reports & Profit Engine (`/reports`)**:
    - Multi-line comparison graph (Gross Revenue vs Net Profit vs Prior benchmark).
    - Department gross margin breakdown.
    - GST liability ledger (CGST, SGST, Taxable).

11. **Settings & Bill Customization (`/settings`)**:
    - Live paper bill preview studio with customizable store details, centralized logo, barcode, QR, and terms.
    - Audio feedback and playful microcopy toggles.

---

## 🛠️ Quick Start

### 1. Setup Backend (FastAPI + Python 3.14)

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Start backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base URL: `http://localhost:8000/api/v1`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Setup Frontend (React 19 + Vite + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```

- Application runs at: `http://localhost:5173`
- Default Route (`/`): Landing Page
- Pricing Page (`/pricing`): Pricing plans & developer links
- Auth Routes (`/login`, `/signup`): Authentication
- Protected Workspace (`/dashboard`, `/billing`, `/inventory`, etc.)

---

## 🔑 Default Accounts (Development / Demo)

| Account Type | Email | Password | Role | Description |
|---|---|---|---|---|
| **Master Admin** | `admin@mybilling.com` | `AdminPassword@123` | `master_admin` | Full system backup & cross-tenant administrative access |
| **Merchant Demo** | `demo@mybilling.com` | `DemoPassword@123` | `user` | Standard isolated business workspace |

To provision a new Master Admin via CLI:
```bash
python -m backend.app.db.provision_admin --name "Admin Name" --email "admin@example.com" --password "SecurePass@123"
```

---

## 📚 Technical Documentation

- [Complete Developer Interview Guide (24 Questions)](docs/INTERVIEW.md)
- [Architecture & Multi-Tenancy Security](docs/ARCHITECTURE.md)
- [Database Schema & Entity Relations](docs/DATABASE_SCHEMA.md)
- [Setup & Deployment Guide](docs/SETUP.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
