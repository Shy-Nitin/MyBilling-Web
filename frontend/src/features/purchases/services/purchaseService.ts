import { apiClient } from "../../../services/api/apiClient";
import { Supplier, PurchaseOrder, PurchaseItem } from "../../../types";

export interface CreateGrnPayload {
  supplier_id: number;
  vendor_invoice_no?: string;
  order_date?: string;
  paid_amount: number;
  notes?: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_cost: number;
    tax_rate: number;
  }>;
}

export interface CreateSupplierPayload {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  payment_terms_days?: number;
  status?: string;
}

export const purchaseService = {
  getSuppliers: async (search?: string, status?: string): Promise<Supplier[]> => {
    return apiClient.get<Supplier[]>("/purchases/suppliers", { search, status });
  },

  getSupplier: async (supplierId: number): Promise<Supplier> => {
    return apiClient.get<Supplier>(`/purchases/suppliers/${supplierId}`);
  },

  createSupplier: async (payload: CreateSupplierPayload): Promise<Supplier> => {
    return apiClient.post<Supplier>("/purchases/suppliers", payload);
  },

  updateSupplier: async (supplierId: number, payload: Partial<CreateSupplierPayload>): Promise<Supplier> => {
    return apiClient.put<Supplier>(`/purchases/suppliers/${supplierId}`, payload);
  },

  deleteSupplier: async (supplierId: number): Promise<{ success: boolean; action: string; message: string }> => {
    return apiClient.delete<{ success: boolean; action: string; message: string }>(`/purchases/suppliers/${supplierId}`);
  },

  getPurchases: async (supplierId?: number): Promise<PurchaseOrder[]> => {
    return apiClient.get<PurchaseOrder[]>("/purchases", { supplier_id: supplierId });
  },

  getPurchase: async (purchaseId: number): Promise<PurchaseOrder> => {
    return apiClient.get<PurchaseOrder>(`/purchases/${purchaseId}`);
  },

  createPurchaseOrder: async (payload: CreateGrnPayload): Promise<PurchaseOrder> => {
    return apiClient.post<PurchaseOrder>("/purchases", payload);
  },

  updatePurchaseOrder: async (purchaseId: number, payload: Partial<CreateGrnPayload>): Promise<PurchaseOrder> => {
    return apiClient.put<PurchaseOrder>(`/purchases/${purchaseId}`, payload);
  },

  deletePurchaseOrder: async (purchaseId: number): Promise<{ success: boolean; message: string; purchase_id: number }> => {
    return apiClient.delete<{ success: boolean; message: string; purchase_id: number }>(`/purchases/${purchaseId}`);
  },

  paySupplier: async (
    supplierId: number,
    amount: number,
    paymentMode: string = "BANK",
    notes?: string
  ): Promise<{ message: string; new_balance: number }> => {
    return apiClient.post("/purchases/pay-supplier", {
      supplier_id: supplierId,
      amount,
      payment_mode: paymentMode,
      notes,
    });
  },
};
