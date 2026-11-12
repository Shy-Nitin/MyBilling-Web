import { apiClient } from "../../../services/api/apiClient";
import { Route } from "../../../types";

export const routeService = {
  getRoutes: async (): Promise<Route[]> => {
    return apiClient.get<Route[]>("/routes");
  },

  createRoute: async (data: { name: string; code?: string; description?: string; is_active?: boolean }): Promise<Route> => {
    return apiClient.post<Route>("/routes", data);
  },

  updateRoute: async (id: number, data: { name?: string; code?: string; description?: string; is_active?: boolean }): Promise<Route> => {
    return apiClient.put<Route>(`/routes/${id}`, data);
  },

  deleteRoute: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/routes/${id}`);
  },
};
