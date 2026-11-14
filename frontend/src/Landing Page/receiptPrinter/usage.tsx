"use client";

import { useEffect, useState } from "react";
import { ReceiptPrinter, type ReceiptPrinterStage } from "./receiptPrinter";

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  unit?: string;
}

export interface ReceiptUsageProps {
  stage?: ReceiptPrinterStage;
  onStageChange?: (stage: ReceiptPrinterStage) => void;
  items?: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  orderNumber?: string;
  paymentMethod?: string;
  customerName?: string;
}

export function ReceiptUsage({
  stage: controlledStage,
  onStageChange,
  items,
  subtotal = 48.0,
  tax = 2.4,
  total = 50.4,
  orderNumber = "ORD-2048",
  paymentMethod = "Cash [F2]",
  customerName = "Counter Walk-in Retail",
}: ReceiptUsageProps) {
  const [internalStage, setInternalStage] = useState<ReceiptPrinterStage>("complete");

  const currentStage = controlledStage ?? internalStage;

  const handleStageChange = (newStage: ReceiptPrinterStage) => {
    if (onStageChange) {
      onStageChange(newStage);
    } else {
      setInternalStage(newStage);
    }
  };

  useEffect(() => {
    if (currentStage === "printing") {
      const timer = setTimeout(() => {
        handleStageChange("complete");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  const displayItems = items && items.length > 0 ? items : [
    { id: "1", name: "Fortune Refined Oil", quantity: 1, rate: 25.0, unit: "TIN" },
    { id: "2", name: "Madhur Sulphur-Free Sugar", quantity: 1, rate: 23.0, unit: "BAG" },
  ];

  const calculatedTotal = total ?? (subtotal + tax);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Controls Strip */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-6 p-1.5 rounded-xl bg-surface-container-high/60 backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleStageChange("processing")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-label-mono-sm transition-all ${
            currentStage === "processing"
              ? "bg-surface-card text-primary shadow-sm font-semibold"
              : "text-text-muted hover:text-on-surface font-medium"
          }`}
        >
          1. Processing
        </button>
        <button
          type="button"
          onClick={() => handleStageChange("printing")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-label-mono-sm transition-all ${
            currentStage === "printing"
              ? "bg-surface-card text-primary shadow-sm font-semibold"
              : "text-text-muted hover:text-on-surface font-medium"
          }`}
        >
          2. Printing Dispatch
        </button>
        <button
          type="button"
          onClick={() => handleStageChange("complete")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-label-mono-sm transition-all ${
            currentStage === "complete"
              ? "bg-surface-card text-primary shadow-sm font-semibold"
              : "text-text-muted hover:text-on-surface font-medium"
          }`}
        >
          3. Receipt Ready
        </button>
      </div>

      <ReceiptPrinter.Root stage={currentStage} feedMotion="stepped">
        <ReceiptPrinter.Machine className="w-[360px] sm:w-[400px] !bg-gray-900 !border-gray-700">
          <ReceiptPrinter.Header>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
              </div>
              <div>
                <span className="font-headline-sm text-xs font-bold text-white block leading-tight">MyBilling Thermal POS</span>
                <span className="font-label-mono-sm text-[10px] text-gray-400">Cloud Bridge • Ready</span>
              </div>
            </div>
            <ReceiptPrinter.Status />
          </ReceiptPrinter.Header>

          <ReceiptPrinter.Screen className="mt-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-headline-sm text-sm font-bold text-grayscale-1 dark:text-grayscale-12 block">
                  {customerName}
                </span>
                <span className="font-label-mono-sm text-[11px] text-grayscale-4 dark:text-grayscale-8">
                  {orderNumber} • {paymentMethod}
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-mono-sm text-[10px] text-grayscale-4 dark:text-grayscale-8 uppercase block">Total</span>
                <span className="font-display-hero text-lg font-bold text-primary-fixed tracking-tight">
                  ${calculatedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </ReceiptPrinter.Screen>
        </ReceiptPrinter.Machine>

        <ReceiptPrinter.Output className="w-[340px] sm:w-[370px]">
          <ReceiptPrinter.Paper className="shadow-[0_4px_24px_rgba(0,0,0,0.25)] bg-white text-gray-900">
            {/* Header info */}
            <div className="flex flex-col items-center pb-3 mb-3 border-b border-dashed border-grayscale-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-1">
                MB
              </div>
              <h4 className="font-bold text-sm text-grayscale-12 tracking-wide uppercase">MyBilling Wholesale Mart</h4>
              <p className="text-[10px] text-grayscale-8">GSTIN: 27AAAAA0000A1Z5 • Beat #04</p>
              <p className="text-[10px] text-grayscale-8 mt-0.5">Counter POS Terminal #01</p>
            </div>

            {/* Meta */}
            <div className="flex justify-between items-center text-[10px] text-grayscale-8 pb-2 mb-2 border-b border-dashed border-grayscale-4">
              <span>{orderNumber}</span>
              <span>{new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>

            {/* Line Items */}
            <div className="space-y-1.5 text-xs text-grayscale-12 mb-3">
              <div className="grid grid-cols-12 text-[10px] font-bold text-grayscale-8 uppercase pb-1 border-b border-grayscale-4">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Amt</span>
              </div>
              {displayItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] py-0.5">
                  <span className="col-span-6 truncate font-medium">{item.name}</span>
                  <span className="col-span-2 text-center text-grayscale-8">{item.quantity}</span>
                  <span className="col-span-4 text-right font-mono">${(item.quantity * item.rate).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-1 text-xs pt-2 border-t border-dashed border-grayscale-4 text-grayscale-8">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-grayscale-12">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST / Tax (5%):</span>
                <span className="font-mono text-grayscale-12">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-grayscale-12 pt-1 border-t border-grayscale-4">
                <span>TOTAL PAID:</span>
                <span className="font-mono text-primary">${calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="flex flex-col items-center justify-center pt-4 mt-3 border-t border-dashed border-grayscale-4">
              <div className="flex items-end justify-center gap-[2px] h-7 w-full max-w-[190px]">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-grayscale-12"
                    style={{
                      width: i % 4 === 0 ? "3px" : i % 2 === 0 ? "1.5px" : "1px",
                      opacity: i % 5 === 0 ? 0.6 : 1,
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] tracking-widest text-grayscale-8 mt-1 font-mono">{orderNumber}</span>
              <p className="text-[9px] text-grayscale-8 mt-1 text-center">Thank you for your business!</p>
            </div>
          </ReceiptPrinter.Paper>
        </ReceiptPrinter.Output>
      </ReceiptPrinter.Root>

      {/* State Feedback Banner */}
      <div className="w-full max-w-sm mt-6">
        {currentStage === "processing" && (
          <div className="p-4 rounded-xl bg-surface-card border border-border-strong text-center shadow-md animate-in fade-in">
            <span className="font-headline-sm text-sm font-semibold text-on-surface block mb-1">Connecting to Thermal Socket</span>
            <p className="font-body-sm text-xs text-text-muted mb-3">Syncing invoice parameters and validating cryptographic hash...</p>
            <button
              type="button"
              onClick={() => handleStageChange("printing")}
              className="w-full py-2 px-4 rounded-lg bg-primary hover:bg-secondary text-on-primary font-headline-sm text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              Start Print Feed
            </button>
          </div>
        )}
        {currentStage === "printing" && (
          <div className="p-4 rounded-xl bg-surface-card border border-primary/40 text-center shadow-md animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-primary font-headline-sm text-sm font-semibold mb-1">
              <svg className="w-4 h-4 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Printing In Progress...</span>
            </div>
            <p className="font-body-sm text-xs text-text-muted">Dispensing thermal paper at 200mm/s</p>
          </div>
        )}
        {currentStage === "complete" && (
          <div className="p-4 rounded-xl bg-surface-card border border-border-strong text-center shadow-md animate-in fade-in flex items-center justify-between">
            <div className="text-left">
              <span className="font-headline-sm text-sm font-bold text-on-surface block">Receipt Verified</span>
              <span className="font-label-mono-sm text-xs text-success-emerald font-semibold">100% Dispatched &amp; Printed</span>
            </div>
            <button
              type="button"
              onClick={() => handleStageChange("printing")}
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-secondary text-on-primary font-headline-sm text-xs font-semibold transition-colors"
            >
              Reprint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default ReceiptUsage;
