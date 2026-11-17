# MyBilling Architecture Documentation

## 1. System Overview

MyBilling is an enterprise-grade ERP and POS operating system designed for wholesale distributors and high-velocity retail billing. It unites an interactive public landing page, multi-tenant workspace isolation, persistent enterprise authentication, physical register ergonomics, double-entry financial journaling, and automated invoice PDF generation into a unified modern architecture.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Frontend (Vite + React 19 + TypeScript)              │
│  - Unified React Router v7 (`/`, `/pricing`, `/login`, `/dashboard`, etc.)   │
│  - AuthContext: In-memory access token + silent cookie-based refresh loop    │
│  - ApiClient: Interceptor injecting Bearer JWT + 401 retry queue            │
│  - Tailwind CSS + Lucide Icons + Recharts + Framer Motion                    │
│  - Centralized Brand Asset: `/Logo.png` across all touchpoints               │
│  - Realtime POS Hotkeys (F1, F2, F4, F6, F9, Alt+K)                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS REST / HttpOnly Cookie (credentials: include)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Backend Service                           │
│  - Authentication Layer (`/api/v1/auth`): Bcrypt, PyJWT, Session Rotation   │
│  - Security Dependency (`get_current_user`): Enforces Row-Level Isolation   │
│  - Administrative Layer (`/api/v1/admin`): Master Admin System Export/Import│
│  - Service Layer: Atomic transactions & Business Logic                       │
│  - ReportLab PDF Engine: Realtime Invoice Generation                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ SQLAlchemy 2.0 ORM (Scored by user_id)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Database Layer (SQLite 3 / PostgreSQL)                   │
│  - users & user_sessions: Persistent auth state & device tracking            │
│  - Invoices & Items with price integrity snapshots (Scoped to user_id)      │
│  - Products & Inventory with stock movements (Scoped to user_id)            │
│  - Double-Entry General Ledger (Sales, Receipts, Expenses)                   │
│  - Shops & Customer Udhar / Credit Ledger (Scoped to user_id)               │
│  - Suppliers & Goods Receipt Notes (GRN) (Scoped to user_id)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Journey & Navigation Architecture

```mermaid
graph TD
    Landing["Landing Page (/)"] -->|Explore Features| DemoModal["In-Memory POS Demo (Client-Side)"]
    Landing -->|View Pricing| Pricing["Pricing Page (/pricing, target='_blank')"]
    Landing -->|Sign In| Login["Login Page (/login)"]
    Landing -->|Sign Up| Signup["Signup Page (/signup)"]
    
    Signup -->|Create Account| Login
    Login -->|Authenticated| Dashboard["Executive Dashboard (/dashboard)"]
    
    subgraph Protected Workspace [Authenticated Merchant Workspace]
        Dashboard --> POS["POS Billing (/billing)"]
        Dashboard --> Inventory["Products & Inventory (/inventory)"]
        Dashboard --> Udhar["Shops & Udhar (/shops)"]
        Dashboard --> Purchases["Purchases & GRN (/purchases)"]
        Dashboard --> Ledger["Double-Entry Ledger (/ledger)"]
        Dashboard --> Reports["Profit & GST Reports (/reports)"]
        Dashboard --> Settings["Store Settings & Template (/settings)"]
    end
    
    Protected Workspace -->|Manual Logout| Landing
```

---

## 3. Authentication & Persistent Session Lifecycle

### Dual-Token Protocol
1. **Access Token (Short-Lived):**
   - In-memory JWT signed with HMAC-SHA256.
   - Lifetime: 15 minutes.
   - Payload: `sub` (User ID), `role` (`user` | `master_admin`), `email`, `exp`.
   - Never written to `localStorage` or `sessionStorage` (XSS immune).
2. **Refresh Token (Long-Lived):**
   - Cryptographically random 64-byte hex string.
   - Stored in backend `user_sessions` table hashed with SHA-256.
   - Issued to client in an `HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth` cookie.
   - Inactive expiration: 30 days. Absolute ceiling: 90 days.
   - Survives browser restarts, tab closures, and laptop reboots.

### Refresh Token Rotation & Replay Defense
- Upon every `/api/v1/auth/refresh` invocation, the existing refresh token is invalidated.
- A new refresh token is issued and set in the response cookie.
- If an already invalidated or revoked token is presented (replay attack), the backend immediately revokes the entire session family.

---

## 4. Multi-Tenant Data Isolation & IDOR Defense

1. **Foreign Key Attachment:**
   - Every tenant data table (`products`, `shops`, `suppliers`, `invoices`, `purchase_orders`, `ledger_entries`, `categories`, `routes`, `system_settings`) contains a mandatory `user_id` Foreign Key.
2. **Cryptographic Identity Derivation:**
   - Endpoints do not accept `user_id` in request bodies, query params, or custom headers.
   - The authenticated user is derived solely by `get_current_user` from the validated JWT signature.
3. **Repository-Level Filtering:**
   - All read queries enforce `.filter(Model.user_id == current_user.id)`.
   - All mutations verify ownership before executing update or delete operations, returning 404/403 on IDOR attempts.

---

## 5. Master Admin & Disaster Recovery Architecture

1. **Role Differentiation:**
   - Standard merchants have `role = "user"`.
   - Administrative engineers have `role = "master_admin"`.
   - Admin status cannot be granted via public API registration. It is provisioned via the secure CLI command:
     ```bash
     python -m backend.app.db.provision_admin --name "Admin Name" --email "admin@example.com" --password "SecurePass@123"
     ```
2. **System-Wide Backup & Restore (`/api/v1/admin/backup`)**:
   - `GET /api/v1/admin/backup/export-system`: Streams a complete, encrypted/structured JSON payload of all registered users, products, invoices, shops, suppliers, and ledger entries across all tenants.
   - `POST /api/v1/admin/backup/restore-system`: Atomic restoration wrapped in an explicit transaction rollback block. Restores users, hashes, and relational dependencies in topological order.

---

## 6. Financial Integrity & Business Rules

1. **Informational MRP vs Active Wholesale Rate**:
   - MRP printed on packaging is purely informational.
   - Line totals are calculated from the agreed wholesale selling rate.
2. **Historical Price Retention**:
   - `InvoiceItem` records historical snapshots of `unit_rate` and `unit_cost` at the moment of billing.
   - Subsequent price alterations in the product catalog never modify prior invoices.
3. **Double-Entry General Ledger**:
   - Every invoice automatically records both sales revenue and receivables / cash drawer inflows.
   - Goods Receipt Notes (GRN) credit accounts payable and debit physical stock.
   - Customer Udhar repayments and supplier disbursements update running account balances and write journal entries.
4. **Realtime Invoice Generation**:
   - ReportLab dynamically generates pixel-perfect PDF bills conforming to the store customization parameters (Header, GSTIN, UPI QR, Barcode, Terms).
