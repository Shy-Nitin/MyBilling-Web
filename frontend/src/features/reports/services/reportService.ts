import { apiClient } from "../../../services/api/apiClient";

export interface ProfitAnalyticsPoint {
  label: string;
  gross_revenue: number;
  net_profit: number;
  prior_revenue: number;
  margin_percent: number;
}

export interface CategoryMargin {
  category: string;
  items_sold: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  margin_percent: number;
}

export interface TaxSummary {
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_tax: number;
}

export interface InvoiceProfitItemSummary {
  product_id: number;
  sku: string;
  product_name: string;
  pack_size: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  unit_rate: number;
  unit_profit: number;
  discount_amount: number;
  total_profit: number;
}

export interface InvoiceProfitSummary {
  id: number;
  invoice_number: string;
  customer_name: string;
  shop_name: string | null;
  date: string;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  profit_margin_percent: number;
  items: InvoiceProfitItemSummary[];
}

export const reportService = {
  getProfitTrends: async (): Promise<ProfitAnalyticsPoint[]> => {
    return apiClient.get<ProfitAnalyticsPoint[]>("/reports/profit-trends");
  },

  getCategoryMargins: async (): Promise<CategoryMargin[]> => {
    return apiClient.get<CategoryMargin[]>("/reports/category-margins");
  },

  getTaxSummary: async (): Promise<TaxSummary> => {
    return apiClient.get<TaxSummary>("/reports/tax-summary");
  },

  getProfitBreakdown: async (
    startDate?: string,
    endDate?: string,
    shopId?: number,
    productId?: number
  ): Promise<InvoiceProfitSummary[]> => {
    return apiClient.get<InvoiceProfitSummary[]>("/reports/profit-breakdown", {
      start_date: startDate,
      end_date: endDate,
      shop_id: shopId,
      product_id: productId,
    });
  },
};
