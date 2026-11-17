# MyBilling Database Schema

The database models are designed using SQLAlchemy 2.0 with full support for SQLite and PostgreSQL. All business entities are partitioned by `user_id` for multi-tenant data isolation.

---

## Entity Relationship Overview

```
                        ┌──────────────────┐
                        │      users       │
                        └────────┬─────────┘
                                 │ (1:N)
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│user_sessions │         │   products   │         │    shops     │
└──────────────┘         └───────┬──────┘         └──────┬───────┘
                                 │                       │
                                 │ (1:N)                 │ (1:N)
                                 ▼                       ▼
                         ┌──────────────┐         ┌──────────────┐
                         │invoice_items │ ◄────── │   invoices   │
                         └──────────────┘         └──────┬───────┘
                                 ▲                       │
                                 │ (1:N)                 ▼
┌──────────────┐         ┌───────┴──────┐         ┌──────────────┐
│  suppliers   │ ──────► │purchase_items│         │ledger_entries│
└──────┬───────┘ (1:N)   └──────────────┘         └──────────────┘
       │                        ▲                        ▲
       │ (1:N)                  │ (1:N)                  │
       └───────────────► ┌──────┴───────┐                │
                         │purchase_orders├────────────────┘
                         └──────────────┘
```

---

## Tables & Columns

### 1. `users` (Account & Tenant Registry)
- `id` (Integer, Primary Key, Auto-increment)
- `email` (String 255, Unique, Indexed, Not Null)
- `hashed_password` (String 255, Not Null) — Bcrypt hashed password
- `full_name` (String 255, Not Null)
- `business_name` (String 255, Nullable)
- `phone` (String 50, Nullable)
- `role` (String 50, Default `"user"`) — `"user"`, `"master_admin"`
- `is_active` (Boolean, Default `True`)
- `created_at` (DateTime, Default UTC now)
- `updated_at` (DateTime, Default UTC now)

### 2. `user_sessions` (Persistent Session & Token Registry)
- `id` (Integer, Primary Key, Auto-increment)
- `user_id` (ForeignKey `users.id`, Indexed, Not Null)
- `refresh_token_hash` (String 255, Unique, Indexed, Not Null) — SHA-256 hash of refresh token
- `expires_at` (DateTime, Not Null) — Inactive timeout limit (30 days)
- `created_at` (DateTime, Default UTC now)
- `last_used_at` (DateTime, Default UTC now)
- `ip_address` (String 100, Nullable)
- `user_agent` (String 500, Nullable)
- `is_revoked` (Boolean, Default `False`)

### 3. `products` (Catalog & Stock)
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey `users.id`, Indexed, Default 1) — Tenant Owner
- `sku` (String 50, Indexed)
- `barcode` (String 50, Indexed)
- `name` (String 200, Not Null)
- `brand` (String 100)
- `category` (String 100, Indexed)
- `pack_size` (String 50)
- `landed_cost` (Float) — Historical purchase landed cost
- `wholesale_rate` (Float) — Current default selling rate
- `mrp` (Float) — Maximum Retail Price (Informational)
- `stock_qty` (Float) — Physical on-hand stock
- `min_stock_threshold` (Float) — Reorder notification point
- `unit` (String 20) — PCS, BAG, TIN, BOX, CASE, etc.
- `is_active` (Boolean, Default `True`)

### 4. `shops` (Udhar & Credit Accounts)
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey `users.id`, Indexed, Default 1) — Tenant Owner
- `name` (String 200)
- `owner_name` (String 100)
- `phone` (String 20, Indexed)
- `gstin` (String 30)
- `address` (String 300)
- `area` (String 100)
- `credit_limit` (Float) — Maximum allowable Udhar balance
- `current_balance` (Float) — Outstanding receivables
- `tier` (String 20) — Standard, Regular, VIP Wholesaler
- `status` (String 20) — Active, Warning, Blocked

### 5. `suppliers` (Vendor Directory)
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey `users.id`, Indexed, Default 1) — Tenant Owner
- `name` (String 200)
- `contact_person` (String 100)
- `phone` (String 20)
- `email` (String 100)
- `gstin` (String 30)
- `address` (String 300)
- `city` (String 100)
- `outstanding_balance` (Float) — Accounts payable
- `payment_terms_days` (Integer)

### 6. `invoices` (Sales Transactions)
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey `users.id`, Indexed, Default 1) — Tenant Owner
- `invoice_number` (String 50, Indexed)
- `shop_id` (ForeignKey `shops.id`, Nullable)
- `customer_name` (String 150)
- `customer_phone` (String 20)
- `subtotal` (Float)
- `discount_amount` (Float)
- `tax_amount` (Float)
- `total_amount` (Float)
- `paid_amount` (Float)
- `balance_amount` (Float)
- `payment_mode` (String 30) — CASH, UPI, UDHAR_CREDIT, SPLIT
- `payment_status` (String 30) — PAID, PARTIAL, UNPAID
- `notes` (Text)
- `created_at` (DateTime)

### 7. `invoice_items` (Historical Line Item Snapshots)
- `id` (Integer, Primary Key)
- `invoice_id` (ForeignKey `invoices.id`)
- `product_id` (ForeignKey `products.id`)
- `sku` (String 50)
- `product_name` (String 200)
- `pack_size` (String 50)
- `quantity` (Float)
- `unit` (String 20)
- `unit_rate` (Float) — Snapshot of selling rate at sale moment
- `unit_cost` (Float) — Snapshot of landed cost at sale moment
- `mrp` (Float)
- `discount_percent` (Float)
- `discount_amount` (Float)
- `tax_rate` (Float)
- `tax_amount` (Float)
- `total_amount` (Float)

### 8. `purchase_orders` (Inward Goods Receipt Notes)
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey `users.id`, Indexed, Default 1) — Tenant Owner
- `po_number` (String 50, Indexed)
- `supplier_id` (ForeignKey `suppliers.id`)
- `vendor_invoice_no` (String 100)
- `order_date` (DateTime)
- `received_date` (DateTime)
- `subtotal` (Float)
- `tax_amount` (Float)
- `total_amount` (Float)
- `paid_amount` (Float)
- `balance_amount` (Float)
- `status` (String 30) — RECEIVED, PENDING, CANCELLED

### 9. `purchase_items` (Inward Stock Line Items)
- `id` (Integer, Primary Key)
- `purchase_id` (ForeignKey `purchase_orders.id`)
- `product_id` (ForeignKey `products.id`)
- `sku` (String 50)
- `product_name` (String 200)
- `quantity` (Float)
- `received_qty` (Float)
- `unit_cost` (Float)
- `tax_rate` (Float)
- `tax_amount` (Float)
- `total_cost` (Float)

### 10. `ledger_entries` (Double-Entry General Journal)
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey `users.id`, Indexed, Default 1) — Tenant Owner
- `entry_number` (String 50, Indexed)
- `transaction_date` (DateTime, Indexed)
- `reference_type` (String 50) — SALE_INVOICE, PURCHASE_GRN, PAYMENT_RECEIVED, SUPPLIER_PAYMENT, EXPENSE
- `reference_id` (String 50)
- `shop_id` (ForeignKey `shops.id`, Nullable)
- `supplier_id` (ForeignKey `suppliers.id`, Nullable)
- `account_type` (String 50) — CASH, BANK, ACCOUNTS_RECEIVABLE, ACCOUNTS_PAYABLE, REVENUE
- `description` (String 300)
- `debit_amount` (Float)
- `credit_amount` (Float)
- `running_balance` (Float)
- `payment_mode` (String 30)

### 11. `system_settings` (Store Profile & Bill Layout)
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey `users.id`, Indexed, Default 1) — Tenant Owner
- Store identity, GSTIN, branch, address, contact, bill header, bill footer, terms and conditions, barcode/logo/QR visibility flags.
