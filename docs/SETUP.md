# MyBilling Setup & Installation Guide

This document provides step-by-step instructions to configure, run, and verify MyBilling on any machine with complete authentication and multi-tenant isolation.

---

## 1. Prerequisites

- **Node.js**: v18+ (tested & verified on v24)
- **Python**: v3.10+ (tested & verified on v3.14)
- **SQLite 3**: Embedded (default zero-configuration) or **PostgreSQL 14+**

---

## 2. Backend Setup

### A. Environment & Dependencies

From the repository root:
```powershell
# Create/activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r backend/requirements.txt
```

Key packages installed:
- `fastapi`, `uvicorn`: High-performance ASGI framework
- `sqlalchemy`: 2.0 ORM with relational integrity
- `bcrypt`: Multi-round password hashing
- `pyjwt`: Cryptographic JSON Web Token encoding/decoding
- `reportlab`: Native PDF generation engine

### B. Database Initialization & Multi-Tenant Migration

The backend automatically executes multi-tenant schema migrations on startup, adding `user_id` foreign keys to existing tables and seeding the initial Master Admin and Demo accounts.

If you ever need to manually provision or reset a Master Admin:
```powershell
python -m backend.app.db.provision_admin --name "Nitin Parashar" --email "admin@mybilling.com" --password "AdminPassword@123"
```

To configure PostgreSQL instead of SQLite:
```powershell
$env:DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5432/mybilling"
```

### C. Start Backend API Server

```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base URL: `http://localhost:8000/api/v1`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## 3. Frontend Setup

### A. Install Dependencies

```powershell
cd frontend
npm install
```

Key packages:
- `react`, `react-dom` (v19)
- `react-router-dom` (v7 unified route tree)
- `tailwindcss`, `lucide-react`, `recharts`, `framer-motion`
- `@phosphor-icons/react`

### B. Start Development Server

```powershell
npm run dev
```

- Local Dev URL: `http://localhost:5173`
- Default Route (`/`): Landing Page
- Pricing Page (`/pricing`): Pricing details & developer links
- Auth Pages (`/login`, `/signup`): Authentication
- Protected Workspace (`/dashboard`, `/billing`, `/inventory`, etc.)

### C. Verify Production Build

```powershell
npm run build
```
Generates optimized static assets in `frontend/dist/`.

---

## 4. Default Seed Accounts

| Account Type | Email | Password | Role | Description |
|---|---|---|---|---|
| **Master Admin** | `admin@mybilling.com` | `AdminPassword@123` | `master_admin` | Access to system-wide backup export & restore |
| **Demo Merchant** | `demo@mybilling.com` | `DemoPassword@123` | `user` | Standard merchant workspace with sample FMCG inventory |

---

## 5. Key POS Keyboard Hotkeys

- `F9`: Jump directly to POS Terminal / Finalize Active Bill
- `F1`: Quick Focus Barcode Scanner / SKU Search
- `F2`: Add New Product to Master Catalog / Switch to Cash Mode
- `F4`: Split Payment Mode
- `F6`: Barcode Label Generator
- `Alt+K`: Global Navigation Search
- `Esc`: Close open modal / clear active selection
