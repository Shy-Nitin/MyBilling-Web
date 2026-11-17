import React, { useState } from "react";
import { X, Printer, FileText, Smartphone, ScrollText, CheckCircle2 } from "lucide-react";
import { apiClient } from "../../services/api/apiClient";

interface PdfFormatSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  invoiceNumber: string;
  type?: "invoice" | "profit";
}

export const PdfFormatSelectorModal: React.FC<PdfFormatSelectorModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  type = "invoice",
}) => {
  const [selectedFormat, setSelectedFormat] = useState<"50mm" | "80mm" | "a4">("80mm");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isProfit = type === "profit";

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const endpoint = isProfit
        ? `/billing/invoices/${invoiceId}/profit-pdf`
        : `/billing/invoices/${invoiceId}/pdf`;

      const blob = await apiClient.downloadBlob(endpoint, { format: selectedFormat });
      const blobUrl = URL.createObjectURL(blob);

      const newWindow = window.open(blobUrl, "_blank");
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${isProfit ? "PROFIT-" : ""}${invoiceNumber}-${selectedFormat}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      onClose();
    } catch (err: any) {
      setDownloadError(err?.message || "Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formats = [
    {
      id: "50mm" as const,
      name: "50mm Thermal Roll",
      desc: "Compact pocket & mobile thermal receipt format (2-inch roll).",
      icon: Smartphone,
      badge: "Compact 2\"",
    },
    {
      id: "80mm" as const,
      name: "80mm POS Thermal Slip",
      desc: "Standard wholesale counter receipt with clean line items (3-inch roll).",
      icon: ScrollText,
      badge: "Popular 3\"",
    },
    {
      id: "a4" as const,
      name: "A4 Full Sheet Standard",
      desc: "Full-page executive invoice for records, audits, and formal billing.",
      icon: FileText,
      badge: "Full Page",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isProfit ? "CONFIDENTIAL PROFIT AUDIT" : "INVOICE DISPATCH"}
            </span>
            <h3 className="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
              {isProfit ? "Download Profit Report PDF" : "Print / Export Invoice PDF"}
            </h3>
            <p className="font-mono text-xs text-primary font-semibold mt-0.5">
              Invoice #{invoiceNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className={`px-5 py-2.5 text-xs font-medium border-b ${
          isProfit 
            ? "bg-amber-50 text-amber-800 border-amber-200" 
            : "bg-indigo-50/70 text-indigo-900 border-indigo-100"
        }`}>
          {isProfit ? (
            <p>
              🔒 <b>Confidential Audit:</b> Shows landed cost, selling rates, unit profits, and net profit margins.
            </p>
          ) : (
            <p>
              🛡️ <b>Customer Safe:</b> Zero GST calculation. Wholesale purchase costs and profit margins are completely hidden.
            </p>
          )}
        </div>

        {/* Format Options */}
        <div className="p-5 flex flex-col gap-3">
          <label className="font-mono text-[11px] font-semibold uppercase text-slate-600 block">
            Select Output Page Dimensions:
          </label>

          <div className="flex flex-col gap-2.5">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormat === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-primary bg-indigo-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {fmt.name}
                        </span>
                        <span className="font-mono text-[9px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                          {fmt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {fmt.desc}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {downloadError && (
          <div className="mx-6 mb-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center justify-between gap-2">
            <span>{downloadError}</span>
            <button
              type="button"
              onClick={() => setDownloadError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-5 py-2 bg-primary-container text-white hover:bg-primary font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating {selectedFormat.toUpperCase()}...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Generate & View {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
