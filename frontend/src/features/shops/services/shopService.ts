import { apiClient } from "../../../services/api/apiClient";
import { Shop } from "../../../types";

export interface CreateShopPayload {
  name: string;
  owner_name?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  area?: string;
  route_id?: number;
  credit_limit: number;
  tier?: string;
  status?: string;
}

export const shopService = {
  getShops: async (params?: { search?: string; route_id?: number; status?: string }): Promise<Shop[]> => {
    return apiClient.get<Shop[]>("/shops", params);
  },

  getShop: async (shopId: number): Promise<Shop> => {
    return apiClient.get<Shop>(`/shops/${shopId}`);
  },

  createShop: async (payload: CreateShopPayload): Promise<Shop> => {
    return apiClient.post<Shop>("/shops", payload);
  },

  updateShop: async (shopId: number, payload: Partial<CreateShopPayload>): Promise<Shop> => {
    return apiClient.put<Shop>(`/shops/${shopId}`, payload);
  },

  deleteShop: async (shopId: number): Promise<{ success: boolean; action: string; message: string }> => {
    return apiClient.delete<{ success: boolean; action: string; message: string }>(`/shops/${shopId}`);
  },

  collectPayment: async (
    shopId: number,
    amount: number,
    paymentMode: string = "CASH",
    notes?: string
  ): Promise<{ message: string; new_balance: number }> => {
    return apiClient.post(`/shops/${shopId}/collect-payment`, {
      amount,
      payment_mode: paymentMode,
      notes,
    });
  },
};
