import { apiClient } from "../../../services/api/apiClient";
import { DashboardMetrics } from "../../../types";

export const dashboardService = {
  getMetrics: async (range: string = "today"): Promise<DashboardMetrics> => {
    return apiClient.get<DashboardMetrics>(`/dashboard/metrics?range=${encodeURIComponent(range)}`);
  },
};
