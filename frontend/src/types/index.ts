export interface Product {
  id: number;
  sku: string;
  barcode?: string;
  name: string;
  brand?: string;
  category: string;
  pack_size: string;
  landed_cost: number;
  wholesale_rate: number;
  mrp: number;
  stock_qty: number;
  min_stock_threshold: number;
  unit: string;
  image_url?: string;
  is_active: boolean;
  stock_status?: "SAFE" | "MODERATE" | "LOW" | "DEPLETED";
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Route {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  shop_count?: number;
}

export interface Shop {
  id: number;
  name: string;
  owner_name?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  area?: string;
  route_id?: number;
  route_name?: string;
  credit_limit: number;
  current_balance: number;
  tier: string;
  status: string;
  total_invoices?: number;
  total_billed?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  outstanding_balance: number;
  payment_terms_days: number;
  status: string;
}

export interface PurchaseItem {
  id?: number;
  purchase_id?: number;
  product_id: number;
  sku: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  tax_rate: number;
  total_amount: number;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name?: string;
  vendor_invoice_no?: string;
  order_date: string;
  received_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  items?: PurchaseItem[];
}

export interface InvoiceItem {
  id?: number;
  product_id: number;
  sku: string;
  product_name: string;
  pack_size?: string;
  quantity: number;
  unit: string;
  unit_rate: number;
  mrp?: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  shop_id?: number;
  customer_name: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_mode: "CASH" | "UPI" | "UDHAR_CREDIT" | "SPLIT";
  payment_status: "PAID" | "PARTIAL" | "UNPAID" | "VOID";
  notes?: string;
  created_at: string;
  items?: InvoiceItem[];
}

export interface LedgerEntry {
  id: number;
  entry_number: string;
  transaction_date: string;
  reference_type: string;
  reference_id?: string;
  shop_id?: number;
  supplier_id?: number;
  account_type: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  payment_mode: string;
}

export interface SystemSettings {
  id: number;
  store_name: string;
  tagline: string;
  branch_name: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  currency_symbol: string;
  tax_rate_default: number;
  bill_header: string;
  bill_footer: string;
  terms_and_conditions: string;
  show_logo: boolean;
  show_barcode: boolean;
  show_qr: boolean;
  upi_id: string;
  upi_payee_name?: string;
  enable_sound: boolean;
  playful_mode: boolean;

  // Independent template customizations
  template_50mm_header?: string;
  template_50mm_footer?: string;
  template_50mm_show_logo?: boolean;
  template_50mm_show_qr?: boolean;
  template_50mm_font_size?: number;

  template_80mm_header?: string;
  template_80mm_footer?: string;
  template_80mm_show_logo?: boolean;
  template_80mm_show_qr?: boolean;
  template_80mm_font_size?: number;

  template_a4_header?: string;
  template_a4_footer?: string;
  template_a4_show_logo?: boolean;
  template_a4_show_qr?: boolean;
  template_a4_font_size?: number;
}

export interface BackupInfo {
  filename: string;
  size_bytes: number;
  size_kb: number;
  created_at: string;
  is_auto_snapshot?: boolean;
}

export interface DashboardMetrics {
  gross_revenue_today: number;
  gross_revenue_change: number;
  net_profit_today: number;
  net_profit_change: number;
  unsettled_udhar: number;
  unsettled_udhar_count: number;
  daily_velocity_invoices: number;
  daily_velocity_change: number;
  sales_pulse: Array<{
    time: string;
    sales: number;
    cash_in: number;
    is_forecast: boolean;
  }>;
  recent_invoices: Array<{
    id: number;
    invoice_number: string;
    shop_customer: string;
    time: string;
    date: string;
    amount: number;
    status: string;
    payment_mode: string;
  }>;
}
