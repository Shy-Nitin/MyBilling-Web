import React, { useState } from "react";
import { SystemSettings } from "../../../types";
import { QrCode, Barcode, Smartphone, ScrollText, FileText } from "lucide-react";
import { UpiQrCode } from "../../../components/common/UpiQrCode";
import { Logo } from "@/components/common/Logo";

interface LiveInvoicePreviewProps {
  settings: SystemSettings;
}

export const LiveInvoicePreview: React.FC<LiveInvoicePreviewProps> = ({ settings }) => {
  const [activeFormat, setActiveFormat] = useState<"50mm" | "80mm" | "a4">("80mm");

  const headerTitle =
    activeFormat === "50mm"
      ? (settings as any).template_50mm_header || "INVOICE / BILL"
      : activeFormat === "80mm"
      ? (settings as any).template_80mm_header || "CASH MEMO / INVOICE"
      : (settings as any).template_a4_header || settings.bill_header || "INVOICE / CASH MEMO";

  const footerText =
    activeFormat === "50mm"
      ? (settings as any).template_50mm_footer || "Thank you! Visit again."
      : activeFormat === "80mm"
      ? (settings as any).template_80mm_footer || "Thank you for your business!"
      : (settings as any).template_a4_footer || settings.bill_footer || "Thank you for your business!";

  return (
    <div className="flex flex-col items-center w-full max-w-lg">
      {/* Format Selector Pills */}
      <div className="flex items-center gap-2 mb-3 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveFormat("50mm")}
          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
            activeFormat === "50mm"
              ? "bg-white text-primary shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>50mm Thermal</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFormat("80mm")}
          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
            activeFormat === "80mm"
              ? "bg-white text-primary shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>80mm POS Slip</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFormat("a4")}
          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
            activeFormat === "a4"
              ? "bg-white text-primary shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>A4 Sheet</span>
        </button>
      </div>

      {/* Preview Card */}
      <div
        className={`bg-white rounded-xl shadow-lg border border-slate-300 p-5 font-sans text-slate-900 select-none transition-all ${
          activeFormat === "50mm"
            ? "w-[240px] text-[10px]"
            : activeFormat === "80mm"
            ? "w-[340px] text-[11px]"
            : "w-full text-xs"
        }`}
      >
        {/* Bill Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-3">
          <div>
            {settings.show_logo && (
              <div className="flex items-center gap-1 mb-1">
                <Logo className="w-5 h-5 rounded object-contain" />
                <span className="font-bold text-[11px] tracking-tight text-primary">
                  {settings.store_name}
                </span>
              </div>
            )}
            <h2 className="font-bold text-xs text-slate-900 leading-snug">
              {settings.store_name}
            </h2>
            <p className="text-[10px] text-slate-500">{settings.branch_name}</p>
            <p className="text-[9px] text-slate-500">{settings.phone}</p>
          </div>

          <div className="text-right">
            <span className="font-mono text-[10px] font-bold text-primary block">
              {headerTitle}
            </span>
            <span className="font-mono text-[10px] text-slate-700 block mt-0.5">
              INV-20261107-0001
            </span>
            <span className="font-mono text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1 py-0.2 rounded border border-emerald-200 inline-block mt-0.5">
              PAID (CASH)
            </span>
          </div>
        </div>

        {/* Customer info */}
        <div className="py-1.5 px-2 bg-slate-50 border border-slate-200/80 rounded my-2 text-[10px] flex justify-between">
          <span><b>Billed To:</b> Walk-in Retail</span>
          <span className="font-mono text-slate-500">98211 44556</span>
        </div>

        {/* Line Items Table (NO GST) */}
        <div className="border border-slate-200 rounded overflow-hidden my-2">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-mono text-[9px] uppercase border-b border-slate-200">
                <th className="py-1 px-1.5">Item</th>
                <th className="py-1 px-1.5 text-right">Qty</th>
                <th className="py-1 px-1.5 text-right">Rate</th>
                <th className="py-1 px-1.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-1 px-1.5 font-sans font-medium text-slate-800">Royal Basmati Rice</td>
                <td className="py-1 px-1.5 text-right">2 BAG</td>
                <td className="py-1 px-1.5 text-right">₹3,650</td>
                <td className="py-1 px-1.5 text-right font-semibold">₹7,300</td>
              </tr>
              <tr>
                <td className="py-1 px-1.5 font-sans font-medium text-slate-800">Fortune Sunflower Oil</td>
                <td className="py-1 px-1.5 text-right">3 TIN</td>
                <td className="py-1 px-1.5 text-right">₹2,040</td>
                <td className="py-1 px-1.5 text-right font-semibold">₹6,120</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Summary (NO GST ROW) */}
        <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            {settings.show_qr && settings.upi_id && (
              <div className="p-0.5 bg-white rounded border border-slate-200 text-center">
                <UpiQrCode
                  upiId={settings.upi_id}
                  payeeName={settings.upi_payee_name || settings.store_name}
                  amount={13420}
                  invoiceNumber="INV-20261107-0001"
                  size={46}
                  showDetails={false}
                />
              </div>
            )}
            {settings.show_barcode && activeFormat !== "50mm" && (
              <div className="p-1 bg-slate-50 rounded border border-slate-200">
                <Barcode className="w-12 h-6 text-slate-800" />
              </div>
            )}
          </div>

          <div className="w-36 font-mono text-[10px] flex flex-col gap-0.5 text-right">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>₹13,420.00</span>
            </div>
            <div className="flex justify-between font-bold text-xs text-primary pt-1 border-t border-slate-200">
              <span>Total:</span>
              <span>₹13,420.00</span>
            </div>
          </div>
        </div>

        {/* Terms & Footer */}
        <div className="mt-3 pt-2 border-t border-slate-200 text-[8px] text-slate-500 font-mono text-center">
          <div className="italic text-slate-700 font-medium">
            {footerText}
          </div>
        </div>
      </div>
    </div>
  );
};
