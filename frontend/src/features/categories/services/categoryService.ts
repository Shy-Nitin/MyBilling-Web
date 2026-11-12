import { apiClient } from "../../../services/api/apiClient";
import { Category } from "../../../types";

export const categoryService = {
  getCategories: async (activeOnly: boolean = false): Promise<Category[]> => {
    return apiClient.get<Category[]>(`/categories?active_only=${activeOnly}`);
  },

  createCategory: async (data: { name: string; description?: string; is_active?: boolean }): Promise<Category> => {
    return apiClient.post<Category>("/categories", data);
  },

  updateCategory: async (id: number, data: { name?: string; description?: string; is_active?: boolean }): Promise<Category> => {
    return apiClient.put<Category>(`/categories/${id}`, data);
  },

  deleteCategory: async (id: number, reassignTo: string = "General"): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/categories/${id}?reassign_to=${encodeURIComponent(reassignTo)}`);
  },
};
