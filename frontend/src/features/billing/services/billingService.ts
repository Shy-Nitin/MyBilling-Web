import { apiClient } from "../../../services/api/apiClient";
import { Invoice, Product, Shop } from "../../../types";

export interface CreateInvoicePayload {
  shop_id?: number | null;
  customer_name: string;
  customer_phone?: string;
  payment_mode: "CASH" | "UPI" | "UDHAR_CREDIT" | "SPLIT";
  paid_amount?: number;
  notes?: string;
  idempotency_key?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_rate: number;
    discount_percent: number;
    tax_rate?: number;
  }>;
}

export interface GetInvoicesParams {
  limit?: number;
  skip?: number;
  shop_id?: number;
  status?: string;
  date_preset?: string;
  start_date?: string;
  end_date?: string;
}

export const billingService = {
  createInvoice: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    return apiClient.post<Invoice>("/billing/invoices", payload);
  },

  updateInvoice: async (id: number, payload: CreateInvoicePayload): Promise<Invoice> => {
    return apiClient.put<Invoice>(`/billing/invoices/${id}`, payload);
  },

  deleteInvoice: async (id: number): Promise<{ success: boolean; message: string; invoice_number: string }> => {
    return apiClient.delete<{ success: boolean; message: string; invoice_number: string }>(`/billing/invoices/${id}`);
  },

  getInvoices: async (params?: GetInvoicesParams | number, legacyShopId?: number): Promise<Invoice[]> => {
    if (typeof params === "number") {
      return apiClient.get<Invoice[]>("/billing/invoices", { limit: params, shop_id: legacyShopId });
    }
    return apiClient.get<Invoice[]>("/billing/invoices", params);
  },

  getInvoiceById: async (id: number): Promise<Invoice> => {
    return apiClient.get<Invoice>(`/billing/invoices/${id}`);
  },

  getProducts: async (search?: string, category?: string): Promise<Product[]> => {
    return apiClient.get<Product[]>("/products", { search, category });
  },

  getShops: async (): Promise<Shop[]> => {
    return apiClient.get<Shop[]>("/shops");
  },
};
