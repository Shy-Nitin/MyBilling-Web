# MyBilling Folder Structure

```text
MyBilling/
├── frontend/
│   ├── index.html                         # Entry HTML with typography, icons & favicon
│   ├── package.json                       # Consolidated dependencies
│   ├── tsconfig.json
│   ├── tsconfig.app.json                  # Path alias '@/ -> src/'
│   ├── vite.config.ts                     # Vite build configuration with alias
│   ├── tailwind.config.js                 # Unified design tokens & animations
│   ├── postcss.config.js
│   ├── public/
│   │   ├── Logo.png                       # Centralized brand logo asset
│   │   ├── textures/                      # Receipt paper & noise SVGs
│   │   └── images/                        # Landing page screen previews
│   └── src/
│       ├── app/
│       │   ├── App.tsx                    # Top-level Router provider
│       │   └── router.tsx                 # Unified React Router v7 configuration
│       ├── Landing Page/                  # Integrated public landing page
│       │   ├── LandingPage.tsx            # Main landing view with interactive demo
│       │   ├── PricingPage.tsx            # Pricing tiers with Nitin's social links
│       │   └── components/                # Landing subcomponents (Navbar, Hero, Bento, etc.)
│       ├── components/
│       │   ├── layout/                    # Shell layout (Sidebar, Header, AppLayout)
│       │   └── common/                    # Logo, MetricCard, StatusBadge, Modal, Stepper
│       ├── context/
│       │   └── AuthContext.tsx            # In-memory access token + silent refresh loop
│       ├── features/
│       │   ├── auth/                      # LoginPage, SignupPage
│       │   ├── dashboard/                 # KPI cards, Sales Pulse chart, Recent Invoices
│       │   ├── billing/                   # Dual-pane POS catalog, Cart, Cash/UPI/Udhar/Split
│       │   ├── products/                  # Catalog, stock status bars, Add Product modal
│       │   ├── shops/                     # Udhar credit cards, debt collection modal
│       │   ├── purchases/                 # Inward GRN receipt, Add vendor, payment voucher
│       │   ├── ledger/                    # Double-entry transaction stream, cash drawer
│       │   ├── reports/                   # Recharts graphs, margin breakdown, GST summary
│       │   └── settings/                  # Store profile, live receipt preview studio
│       ├── helpers/
│       │   └── classname-helper.ts        # Tailwind class merge helper
│       ├── lib/
│       │   ├── formatters.ts              # Currency (₹ INR), numbers, dates, times
│       │   └── utils.ts                   # Class merge utilities
│       ├── services/api/
│       │   └── apiClient.ts               # Fetch client with auto-refresh queue
│       ├── types/
│       │   └── index.ts                   # Domain & Auth TypeScript definitions
│       ├── styles/
│       │   └── globals.css                # Tailwind CSS layers, animations & patterns
│       └── main.tsx                       # React application entrypoint
├── backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI application instance & CORS
│   │   ├── core/
│   │   │   ├── config.py                  # Pydantic environment configuration
│   │   │   ├── database.py                # SQLAlchemy engine & session factory
│   │   │   └── security.py                # Bcrypt hashing, JWT encode/decode, token rotation
│   │   ├── api/
│   │   │   ├── deps.py                    # get_current_user & get_current_admin dependencies
│   │   │   ├── router.py                  # API router mounting /api/v1
│   │   │   └── v1/
│   │   │       ├── auth.py                # /signup, /login, /refresh, /logout, /me
│   │   │       ├── admin.py               # Master admin system backup export/restore
│   │   │       ├── dashboard.py           # User-scoped KPI metrics
│   │   │       ├── billing.py             # User-scoped invoice creation & PDF streaming
│   │   │       ├── products.py            # User-scoped catalog & stock operations
│   │   │       ├── shops.py               # User-scoped Udhar customer accounts
│   │   │       ├── purchases.py           # User-scoped GRN & supplier records
│   │   │       ├── ledger.py              # User-scoped double-entry journal
│   │   │       ├── reports.py             # User-scoped profit & tax analytics
│   │   │       └── settings.py            # User-scoped business profile & bill layout
│   │   ├── models/
│   │   │   ├── user.py                    # User model with role & active flags
│   │   │   ├── session.py                 # UserSession model with refresh token hash
│   │   │   └── ...                        # Product, Shop, Supplier, Invoice, Ledger
│   │   ├── schemas/
│   │   │   ├── auth.py                    # UserRegister, UserLogin, UserResponse
│   │   │   └── ...                        # Entity schemas
│   │   ├── services/                      # Business logic (billing, inventory, pdf, report)
│   │   └── db/
│   │       ├── init_db.py                 # Startup hook executing schema migrations
│   │       ├── migrate_multitenant.py     # Additive SQLite migration & seed initial users
│   │       └── provision_admin.py         # CLI tool to provision Master Admin accounts
│   ├── requirements.txt                   # Python dependencies (pyjwt, bcrypt, etc.)
│   └── run_backend.py                     # Convenience backend runner
├── backups/                               # Database pre-integration backups
├── docs/
│   ├── INTERVIEW.md                       # Comprehensive 24-question engineering interview
│   ├── ARCHITECTURE.md                    # Technical architecture & multi-tenancy design
│   ├── DATABASE_SCHEMA.md                 # Table schemas & entity relationships
│   ├── SETUP.md                           # Quick start & deployment instructions
│   └── FOLDER_STRUCTURE.md                # Project file & directory tree
├── mybilling.db                           # Multi-tenant SQLite database
└── README.md                              # Main project documentation
```
