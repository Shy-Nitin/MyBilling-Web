import { useState } from "react";
import { ReceiptUsage } from "../../../receiptPrinter/usage";
import { type ReceiptPrinterStage } from "../../../receiptPrinter/receiptPrinter";

export interface ReceiptSectionProps {
  currentStage: ReceiptPrinterStage;
  onStageChange: (stage: ReceiptPrinterStage) => void;
  invoiceData: {
    items: { id: string; name: string; quantity: number; rate: number; unit?: string }[];
    subtotal: number;
    tax: number;
    total: number;
    customerName: string;
    paymentMode: string;
    orderNumber?: string;
  };
}

export function ReceiptSection({
  currentStage,
  onStageChange,
  invoiceData,
}: ReceiptSectionProps) {
  return (
    <div
      id="receipt-printer-section"
      className="mt-16 pt-16 border-t border-border-strong/80 flex flex-col items-center w-full px-margin"
    >
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-tertiary-fixed-dim/20 via-primary/10 to-secondary-container/15 text-primary border border-tertiary-fixed-dim/40 font-label-mono-sm text-label-mono-sm font-bold shadow-sm mb-3">
          <span className="material-symbols-outlined text-[15px] text-primary">print</span>
          <span className="tracking-wide">HARDWARE INTEGRATION</span>
        </div>
        <h3 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg font-bold text-on-surface tracking-tight">
          Sleek Thermal Receipt Terminal
        </h3>
        <p className="font-body-md text-text-muted mt-2">
          Experience ultra-fast cloud printing emulation. Watch the paper roll dispatch in real-time with automatic tax breakdown and cryptographic barcode.
        </p>
      </div>

      <div className="w-full flex justify-center">
        <ReceiptUsage
          stage={currentStage}
          onStageChange={onStageChange}
          items={invoiceData.items}
          subtotal={invoiceData.subtotal}
          tax={invoiceData.tax}
          total={invoiceData.total}
          customerName={invoiceData.customerName}
          paymentMethod={invoiceData.paymentMode}
          orderNumber={invoiceData.orderNumber || "INV-2048"}
        />
      </div>
    </div>
  );
}
export default ReceiptSection;