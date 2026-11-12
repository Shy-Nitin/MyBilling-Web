import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatCurrency } from "../../lib/formatters";

interface UpiQrCodeProps {
  upiId?: string;
  payeeName?: string;
  amount: number;
  invoiceNumber?: string;
  size?: number;
  showDetails?: boolean;
  className?: string;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiId,
  payeeName = "MyBilling Wholesale",
  amount,
  invoiceNumber,
  size = 140,
  showDetails = true,
  className = "",
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!upiId || amount <= 0) {
      setQrUrl(null);
      return;
    }

    const cleanUpi = upiId.trim();
    const cleanPayee = (payeeName || "MyBilling Wholesale").trim();
    const note = invoiceNumber ? `Invoice ${invoiceNumber}` : "Wholesale Bill";
    
    // Dynamic UPI payment URI format
    const upiUri = `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(cleanPayee)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

    QRCode.toDataURL(upiUri, {
      width: size,
      margin: 1,
      color: {
        dark: "#0b1c30",
        light: "#ffffff",
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => {
        console.error("Failed to generate UPI QR code", err);
        setQrUrl(null);
      });
  }, [upiId, payeeName, amount, invoiceNumber, size]);

  if (!upiId) {
    return (
      <div className={`p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-center ${className}`}>
        <p className="text-xs text-amber-800 font-medium">UPI ID not configured in Settings.</p>
      </div>
    );
  }

  if (amount <= 0 || !qrUrl) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs ${className}`}>
      <div className="relative">
        <img
          src={qrUrl}
          alt={`Scan to Pay ${formatCurrency(amount)}`}
          className="rounded-lg border border-slate-100"
          style={{ width: size, height: size }}
        />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary-container text-white text-[10px] font-mono font-bold rounded-full shadow-xs whitespace-nowrap">
          {formatCurrency(amount)}
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 text-center">
          <p className="text-[11px] font-semibold text-slate-800">Scan with any UPI App</p>
          <p className="text-[10px] font-mono text-slate-500">{upiId}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-[9px] font-mono text-slate-400">
            <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
          </div>
        </div>
      )}
    </div>
  );
};
