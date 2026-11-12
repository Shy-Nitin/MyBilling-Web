import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Settings as SettingsIcon,
  FileText,
  CheckCircle2,
  Smartphone,
  ScrollText,
  QrCode,
  Download,
  Upload,
  Database,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
  HardDrive,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { LiveInvoicePreview } from "../components/LiveInvoicePreview";
import { UpiQrCode } from "../../../components/common/UpiQrCode";
import { Modal } from "../../../components/common/Modal";
import { settingsService, MobileImportPreview } from "../services/settingsService";
import { SystemSettings, BackupInfo } from "../../../types";
import { formatCurrency } from "../../../lib/formatters";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "bill_studio" | "upi_settings" | "data_transfer" | "backup_restore" | "governance"
  >("bill_studio");

  const [activeFormatTab, setActiveFormatTab] = useState<"80mm" | "50mm" | "a4">("80mm");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ==========================================
  // MOBILE DATA IMPORT / EXPORT STATE
  // ==========================================
  const [exportIncludeProducts, setExportIncludeProducts] = useState(true);
  const [exportIncludeShops, setExportIncludeShops] = useState(true);
  const [exportIncludeCategories, setExportIncludeCategories] = useState(true);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<MobileImportPreview | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [updateExistingRecords, setUpdateExistingRecords] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // DATABASE BACKUP & RESTORE STATE
  // ==========================================
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  // Restore Modal State
  const [restoreTargetFilename, setRestoreTargetFilename] = useState<string | null>(null);
  const [uploadedDbFile, setUploadedDbFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const dbUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "backup_restore") {
      loadBackups();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const list = await settingsService.listBackups();
      setBackups(list);
    } catch (err) {
      console.error("Failed to list backups", err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // MOBILE IMPORT / EXPORT HANDLERS
  // ==========================================
  const handleExportJson = () => {
    const url = settingsService.exportMobileJsonUrl(
      exportIncludeProducts,
      exportIncludeShops,
      exportIncludeCategories
    );
    window.open(url, "_blank");
  };

  const handleSelectImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportSuccessMessage(null);
    try {
      setIsPreviewing(true);
      const preview = await settingsService.previewMobileImport(file);
      setImportPreview(preview);
    } catch (err: any) {
      alert(`Validation error in JSON file: ${err?.message || err}`);
      setImportFile(null);
      setImportPreview(null);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importFile) return;
    try {
      setIsImporting(true);
      const res = await settingsService.importMobileJson(importFile, updateExistingRecords);
      setImportSuccessMessage(
        `Import Completed! Added ${res.imported.products.added} products, ${res.imported.shops.added} shops, ${res.imported.categories.added} categories.`
      );
      setImportFile(null);
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert(`Import failed: ${err?.message || err}`);
    } finally {
      setIsImporting(false);
    }
  };

  // ==========================================
  // DATABASE BACKUP & RESTORE HANDLERS
  // ==========================================
  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const newBackup = await settingsService.createBackup();
      setBackupNotice(`Created backup: ${newBackup.filename} (${newBackup.size_kb} KB)`);
      setTimeout(() => setBackupNotice(null), 6000);
      loadBackups();
    } catch (err: any) {
      alert(`Backup failed: ${err?.message || err}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Delete backup file '${filename}'?`)) return;
    try {
      await settingsService.deleteBackup(filename);
      loadBackups();
    } catch (err: any) {
      alert(err?.message || "Failed to delete backup.");
    }
  };

  const handleOpenRestoreConfirm = (filename: string) => {
    setRestoreTargetFilename(filename);
    setUploadedDbFile(null);
    setIsRestoreModalOpen(true);
  };

  const handleUploadDbFileForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedDbFile(file);
    setRestoreTargetFilename(null);
    setIsRestoreModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    try {
      setIsRestoring(true);
      const res = await settingsService.restoreBackup({
        filename: restoreTargetFilename || undefined,
        file: uploadedDbFile || undefined,
      });
      setIsRestoreModalOpen(false);
      setBackupNotice(
        `Database successfully restored! (${res.tables_restored} tables reloaded). Safety snapshot saved: ${res.safety_snapshot}`
      );
      loadBackups();
      loadSettings();
    } catch (err: any) {
      alert(`Restore failed: ${err?.message || err}`);
    } finally {
      setIsRestoring(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-secondary font-mono text-xs">
        Loading system governance parameters...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Header & Navigation Tabs */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("bill_studio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeTab === "bill_studio"
                ? "bg-primary-container text-white border-primary"
                : "bg-surface-container-low text-slate-700 border-slate-200/60 hover:bg-surface-container"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bill Customization Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upi_settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeTab === "upi_settings"
                ? "bg-primary-container text-white border-primary"
                : "bg-surface-container-low text-slate-700 border-slate-200/60 hover:bg-surface-container"
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-primary" />
            <span>UPI Payment & Dynamic QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("data_transfer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeTab === "data_transfer"
                ? "bg-primary-container text-white border-primary"
                : "bg-surface-container-low text-slate-700 border-slate-200/60 hover:bg-surface-container"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mobile JSON Data Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("backup_restore")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeTab === "backup_restore"
                ? "bg-primary-container text-white border-primary"
                : "bg-surface-container-low text-slate-700 border-slate-200/60 hover:bg-surface-container"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-700" />
            <span>Database Backup & Restore</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("governance")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              activeTab === "governance"
                ? "bg-primary-container text-white border-primary"
                : "bg-surface-container-low text-slate-700 border-slate-200/60 hover:bg-surface-container"
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Store Profile & Flags</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Changes Saved!</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BILL CUSTOMIZATION STUDIO                                          */}
      {/* ========================================================================= */}
      {activeTab === "bill_studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <form
            onSubmit={handleSave}
            className="lg:col-span-7 bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-slate-200/70 flex flex-col gap-5"
          >
            <div className="border-b border-slate-200 pb-3">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-2">
                Independent Template Customization (50mm, 80mm, A4)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveFormatTab("80mm")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeFormatTab === "80mm"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>80mm POS Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFormatTab("50mm")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeFormatTab === "50mm"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>50mm Thermal Roll</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFormatTab("a4")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeFormatTab === "a4"
                      ? "bg-primary text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>A4 Full Sheet</span>
                </button>
              </div>
            </div>

            {/* Template Specific Inputs */}
            {activeFormatTab === "80mm" && (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">
                  80mm Standard POS Slip Customization
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                      Header Title
                    </label>
                    <input
                      type="text"
                      value={settings.template_80mm_header || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, template_80mm_header: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                      Font Size (pt)
                    </label>
                    <input
                      type="number"
                      value={settings.template_80mm_font_size || 8}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          template_80mm_font_size: parseInt(e.target.value, 10) || 8,
                        })
                      }
                      className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                    Footer Message
                  </label>
                  <input
                    type="text"
                    value={settings.template_80mm_footer || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, template_80mm_footer: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                  />
                </div>
              </div>
            )}

            {activeFormatTab === "50mm" && (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">
                  50mm Ultra-Compact Thermal Roll
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                      Header Title
                    </label>
                    <input
                      type="text"
                      value={settings.template_50mm_header || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, template_50mm_header: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                      Font Size (pt)
                    </label>
                    <input
                      type="number"
                      value={settings.template_50mm_font_size || 7}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          template_50mm_font_size: parseInt(e.target.value, 10) || 7,
                        })
                      }
                      className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                    Footer Message
                  </label>
                  <input
                    type="text"
                    value={settings.template_50mm_footer || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, template_50mm_footer: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                  />
                </div>
              </div>
            )}

            {activeFormatTab === "a4" && (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">
                  A4 Full Sheet Standard Invoice
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                      Header Title
                    </label>
                    <input
                      type="text"
                      value={settings.template_a4_header || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, template_a4_header: e.target.value })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                      Font Size (pt)
                    </label>
                    <input
                      type="number"
                      value={settings.template_a4_font_size || 9}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          template_a4_font_size: parseInt(e.target.value, 10) || 9,
                        })
                      }
                      className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                    Footer Message
                  </label>
                  <input
                    type="text"
                    value={settings.template_a4_footer || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, template_a4_footer: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-6 bg-primary-container text-white hover:bg-primary font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Apply & Save Template"}</span>
              </button>
            </div>
          </form>

          {/* Right Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="font-mono text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Live Paper Bill Preview Studio
            </span>
            <LiveInvoicePreview settings={settings} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPI PAYMENT & DYNAMIC QR SETTINGS                                  */}
      {/* ========================================================================= */}
      {activeTab === "upi_settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <form
            onSubmit={handleSave}
            className="lg:col-span-7 bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-slate-200/70 flex flex-col gap-4"
          >
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span>UPI Payment & Dynamic QR Settings</span>
              </h3>
              <p className="font-body-md text-body-md text-secondary mt-0.5">
                Every generated customer bill (print, PDF, screen) includes an instant QR code with the exact payable amount.
              </p>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-200/70 rounded-xl text-xs text-indigo-950 flex flex-col gap-1">
              <span className="font-semibold text-primary">Dynamic Amount Embedding:</span>
              <p className="text-[11px] text-slate-600">
                When a customer scans the QR with Google Pay, PhonePe, Paytm, or BHIM, the payable total (e.g. ₹1,245.00) is pre-filled automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                  UPI VPA / ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mybilling@okhdfcbank"
                  value={settings.upi_id || ""}
                  onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                  className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                  Payee Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MyBilling Wholesale & Retail"
                  value={settings.upi_payee_name || ""}
                  onChange={(e) => setSettings({ ...settings, upi_payee_name: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.show_qr}
                  onChange={(e) => setSettings({ ...settings, show_qr: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span>Enable Dynamic UPI QR on customer invoices, screens & PDFs</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-6 bg-primary-container text-white hover:bg-primary font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save UPI Settings"}</span>
              </button>
            </div>
          </form>

          {/* Right Live Test QR */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-xl border border-slate-200/70 shadow-sm text-center">
            <span className="font-mono text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
              Live QR Test Scanner Preview
            </span>
            <UpiQrCode
              upiId={settings.upi_id}
              payeeName={settings.upi_payee_name || settings.store_name}
              amount={1245}
              invoiceNumber="INV-TEST-001"
              size={160}
            />
            <p className="text-[11px] text-slate-500 mt-3 max-w-xs">
              Test by scanning this QR with your phone's camera or UPI app. It will open with <strong>₹1,245.00</strong> pre-filled to <strong>{settings.upi_id}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MOBILE JSON DATA IMPORT / EXPORT (SECTION 13)                      */}
      {/* ========================================================================= */}
      {activeTab === "data_transfer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
          {/* Selective Export Card */}
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-slate-200/70 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-5 h-5 text-primary" />
                <h3 className="font-headline-sm text-headline-sm font-semibold text-slate-900">
                  Export Mobile Compatible JSON
                </h3>
              </div>
              <p className="text-xs text-secondary">
                Generate a clean, lightweight JSON file containing outlets and product catalogs for Maya Billing Mobile App. Financial transactions and invoices are excluded.
              </p>

              <div className="mt-4 flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">
                  Select Data Collections to Export:
                </span>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={exportIncludeProducts}
                    onChange={(e) => setExportIncludeProducts(e.target.checked)}
                    className="rounded text-primary w-4 h-4"
                  />
                  <span>Master Product Catalog (SKUs, Rates, Units)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={exportIncludeShops}
                    onChange={(e) => setExportIncludeShops(e.target.checked)}
                    className="rounded text-primary w-4 h-4"
                  />
                  <span>Outlets & Registered Shops (Names, Phones, Credit Limits)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={exportIncludeCategories}
                    onChange={(e) => setExportIncludeCategories(e.target.checked)}
                    className="rounded text-primary w-4 h-4"
                  />
                  <span>Product Categories & Departments</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              className="h-10 px-5 bg-primary-container hover:bg-primary text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors self-start"
            >
              <Download className="w-4 h-4" />
              <span>Download Mobile Export (.json)</span>
            </button>
          </div>

          {/* Selective Import Card */}
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-slate-200/70 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="font-headline-sm text-headline-sm font-semibold text-slate-900">
                  Import Maya Mobile JSON Data
                </h3>
              </div>
              <p className="text-xs text-secondary">
                Upload a JSON file from Maya Billing mobile order-taking app. Outlets and products are mapped safely into web admin models.
              </p>

              {importSuccessMessage && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* Upload Input */}
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleSelectImportFile}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Preview Details */}
              {isPreviewing && (
                <div className="mt-3 p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Parsing and validating JSON structure...</span>
                </div>
              )}

              {importPreview && (
                <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-800">File Structure Validated</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Safe to Import
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">Products</span>
                      <strong className="text-xs text-slate-900">
                        {importPreview.summary.products.total}
                      </strong>
                      <span className="text-[9px] text-emerald-600 block">
                        ({importPreview.summary.products.new} new)
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">Shops</span>
                      <strong className="text-xs text-slate-900">
                        {importPreview.summary.shops.total}
                      </strong>
                      <span className="text-[9px] text-emerald-600 block">
                        ({importPreview.summary.shops.new} new)
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase">Categories</span>
                      <strong className="text-xs text-slate-900">
                        {importPreview.summary.categories.total}
                      </strong>
                      <span className="text-[9px] text-emerald-600 block">
                        ({importPreview.summary.categories.new} new)
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={updateExistingRecords}
                      onChange={(e) => setUpdateExistingRecords(e.target.checked)}
                      className="rounded text-primary w-4 h-4"
                    />
                    <span>Update pricing/names for existing matching records</span>
                  </label>
                </div>
              )}
            </div>

            {importPreview && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors self-start"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing Data...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Import Data</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLETE DATABASE BACKUP & RESTORE (SECTION 14)                    */}
      {/* ========================================================================= */}
      {activeTab === "backup_restore" && (
        <div className="flex flex-col gap-space-lg">
          {/* Top Banner & Action */}
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-5 h-5 text-indigo-700" />
                <h3 className="font-headline-sm text-headline-sm font-semibold text-slate-900">
                  Full Database Backup & Disaster Recovery
                </h3>
              </div>
              <p className="text-xs text-secondary max-w-xl">
                Independent snapshot of your entire database (invoices, ledgers, inventory, shops, and settings). Full restore automatically generates a pre-restore safety snapshot before touching the live system.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={dbUploadRef}
                type="file"
                accept=".db,.sqlite,.sqlite3"
                onChange={handleUploadDbFileForRestore}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => dbUploadRef.current?.click()}
                className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Upload className="w-4 h-4" />
                <span>Upload .db to Restore</span>
              </button>

              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="h-10 px-5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors"
              >
                {isCreatingBackup ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Backing Up...</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>Create Full Backup Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {backupNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
              <span>{backupNotice}</span>
              <button onClick={() => setBackupNotice(null)} className="text-emerald-700 font-semibold hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Backups Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200/70 overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-slate-700 uppercase">
                Available Backups in Storage ({backups.length})
              </span>
              <button
                type="button"
                onClick={loadBackups}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Refresh Backups List"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low/80 text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-4 font-medium">Backup Filename</th>
                    <th className="py-2.5 px-4 font-medium">Type</th>
                    <th className="py-2.5 px-4 font-medium">Size</th>
                    <th className="py-2.5 px-4 font-medium">Date Created</th>
                    <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {loadingBackups ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Loading backups...</span>
                        </div>
                      </td>
                    </tr>
                  ) : backups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No backup files yet. Click "Create Full Backup Now" above.
                      </td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.filename} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {b.filename}
                        </td>
                        <td className="py-2.5 px-4">
                          {b.is_auto_snapshot ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[10px] font-semibold">
                              Safety Snapshot
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 text-[10px] font-semibold">
                              Manual Backup
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {b.size_kb} KB
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {b.created_at}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <a
                              href={settingsService.getBackupDownloadUrl(b.filename)}
                              download={b.filename}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleOpenRestoreConfirm(b.filename)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteBackup(b.filename)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Delete Backup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STORE PROFILE & GOVERNANCE                                         */}
      {/* ========================================================================= */}
      {activeTab === "governance" && (
        <form
          onSubmit={handleSave}
          className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm border border-slate-200/70 max-w-3xl flex flex-col gap-4"
        >
          <div>
            <h3 className="font-headline-sm text-headline-sm font-semibold text-slate-900">
              System Governance & Store Identity
            </h3>
            <p className="font-body-md text-body-md text-secondary mt-0.5">
              Wholesale trade credentials, legal address, and operational mode flags.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                Storefront Name
              </label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                Branch Location #
              </label>
              <input
                type="text"
                value={settings.branch_name}
                onChange={(e) => setSettings({ ...settings, branch_name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                Support Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
              Store & APMC Yard Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-600 uppercase block font-semibold mb-1">
              Standard Bill Terms & Conditions
            </label>
            <textarea
              rows={2}
              value={settings.terms_and_conditions}
              onChange={(e) =>
                setSettings({ ...settings, terms_and_conditions: e.target.value })
              }
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-medium"
            />
          </div>

          <div className="divide-y divide-slate-100 text-xs pt-2">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">
                  Audio Feedback on Barcode Scan
                </span>
                <span className="text-slate-500">
                  Emit cashier register sound beep upon barcode or hotkey trigger.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_sound}
                onChange={(e) =>
                  setSettings({ ...settings, enable_sound: e.target.checked })
                }
                className="rounded text-primary w-4 h-4"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">
                  Accounting Tax Mode
                </span>
                <span className="text-slate-500">
                  Direct wholesale selling rates (Zero-GST Mode active).
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                0% GST (Clean Wholesale)
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="self-start mt-2 h-10 px-6 bg-primary-container text-white hover:bg-primary font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            {isSaving ? "Saving..." : "Save Governance Settings"}
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* RESTORE DATABASE CONFIRMATION MODAL                                       */}
      {/* ========================================================================= */}
      {isRestoreModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRestoreModalOpen(false)}
          title="Restore Database Confirmation"
          subtitle="Full database rollback & recovery procedure."
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 flex flex-col gap-1">
                <p className="font-semibold">
                  Are you sure you want to restore from{" "}
                  <strong>{restoreTargetFilename || uploadedDbFile?.name || "backup file"}</strong>?
                </p>
                <p>
                  This will reload all invoices, inventory, shops, and ledger accounts. An automatic pre-restore safety snapshot of your current database will be taken immediately before restoring.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRestoreModalOpen(false)}
                disabled={isRestoring}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring Database...</span>
                  </>
                ) : (
                  <span>Confirm Restore</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
