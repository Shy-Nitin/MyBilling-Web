import { apiClient } from "../../../services/api/apiClient";
import { SystemSettings, BackupInfo } from "../../../types";

export interface MobileImportPreview {
  valid: boolean;
  source_app: string;
  exported_at?: string;
  summary: {
    categories: { total: number; new: number; existing: number };
    shops: { total: number; new: number; existing: number };
    products: { total: number; new: number; existing: number };
  };
  preview_items: {
    categories: Array<{ item: any; status: string }>;
    shops: Array<{ item: any; status: string }>;
    products: Array<{ item: any; status: string }>;
  };
}

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    return apiClient.get<SystemSettings>("/settings");
  },

  updateSettings: async (payload: Partial<SystemSettings>): Promise<SystemSettings> => {
    return apiClient.put<SystemSettings>("/settings", payload);
  },

  // Mobile JSON Data Transfer
  exportMobileJsonUrl: (includeProducts = true, includeShops = true, includeCategories = true): string => {
    return `/api/v1/data-transfer/export-json?include_products=${includeProducts}&include_shops=${includeShops}&include_categories=${includeCategories}`;
  },

  previewMobileImport: async (file: File): Promise<MobileImportPreview> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.postFormData<MobileImportPreview>("/data-transfer/preview-import", formData);
  },

  importMobileJson: async (file: File, updateExisting: boolean = true): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.postFormData<any>(`/data-transfer/import-json?update_existing=${updateExisting}`, formData);
  },

  // Complete Database Backup & Restore
  listBackups: async (): Promise<BackupInfo[]> => {
    return apiClient.get<BackupInfo[]>("/backup/list");
  },

  createBackup: async (): Promise<BackupInfo> => {
    return apiClient.post<BackupInfo>("/backup/create");
  },

  deleteBackup: async (filename: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/backup/${encodeURIComponent(filename)}`);
  },

  getBackupDownloadUrl: (filename: string): string => {
    return `/api/v1/backup/download/${encodeURIComponent(filename)}`;
  },

  restoreBackup: async (options: { filename?: string; file?: File }): Promise<any> => {
    if (options.file) {
      const formData = new FormData();
      formData.append("file", options.file);
      return apiClient.postFormData<any>("/backup/restore", formData);
    } else if (options.filename) {
      return apiClient.post<any>(`/backup/restore?filename=${encodeURIComponent(options.filename)}`);
    }
    throw new Error("Must provide either a backup file or a filename.");
  },
};
