-- ==============================================================================
-- MyBilling - Supabase PostgreSQL Row Level Security (RLS) Configuration
-- ==============================================================================
-- Note: FastAPI backend connects with database credentials (bypassing RLS by default).
-- These policies provide defense-in-depth if PostgREST or Supabase JS client is used.
-- ==============================================================================

-- 1. Helper function to get current internal user_id from auth.uid()
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS integer AS $$
  SELECT id FROM users WHERE supabase_uid = auth.uid()::text OR email = auth.jwt()->>'email' LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Helper function to check if current user is master_admin
CREATE OR REPLACE FUNCTION is_master_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE (supabase_uid = auth.uid()::text OR email = auth.jwt()->>'email')
      AND role = 'master_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- 4. Users Table Policies
CREATE POLICY "users_select_self_or_admin" ON users
  FOR SELECT USING (
    id = get_current_user_id() OR is_master_admin()
  );

CREATE POLICY "users_update_self_or_admin" ON users
  FOR UPDATE USING (
    id = get_current_user_id() OR is_master_admin()
  );

-- 5. Business Entities Scoped by user_id
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['system_settings', 'categories', 'routes', 'suppliers', 'shops', 'products', 'invoices', 'purchase_orders', 'ledger_entries'])
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "%s_tenant_isolation" ON %I;
      CREATE POLICY "%s_tenant_isolation" ON %I
        FOR ALL USING (
          user_id = get_current_user_id() OR is_master_admin()
        )
        WITH CHECK (
          user_id = get_current_user_id() OR is_master_admin()
        );
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- 6. Child tables (invoice_items, purchase_items)
DROP POLICY IF EXISTS "invoice_items_tenant_isolation" ON invoice_items;
CREATE POLICY "invoice_items_tenant_isolation" ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND (invoices.user_id = get_current_user_id() OR is_master_admin())
    )
  );

DROP POLICY IF EXISTS "purchase_items_tenant_isolation" ON purchase_items;
CREATE POLICY "purchase_items_tenant_isolation" ON purchase_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM purchase_orders
      WHERE purchase_orders.id = purchase_items.purchase_id
        AND (purchase_orders.user_id = get_current_user_id() OR is_master_admin())
    )
  );
