import React from "react";
import { Store, Phone, MapPin, Receipt, ShieldAlert, CheckCircle2, Wallet, UserCheck } from "lucide-react";
import { Modal } from "../../../components/common/Modal";
import { Shop } from "../../../types";
import { formatCurrency } from "../../../lib/formatters";
import { UdharLimitGauge } from "./UdharLimitGauge";

interface ShopDetailsModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (shop: Shop) => void;
}

export const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({
  shop,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!shop) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={shop.name}
      subtitle={`Customer Account #${shop.id} • ${shop.tier} Tier`}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Status & Key Stats Header */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center font-mono">
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Account Status</span>
            <span className={`text-xs font-bold ${shop.status === "Active" ? "text-emerald-700" : shop.status === "Archived" ? "text-slate-500" : "text-amber-700"}`}>
              {shop.status}
            </span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Total Invoices</span>
            <span className="text-xs font-bold text-slate-800">{shop.total_invoices || 0}</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 uppercase block">Total Billed</span>
            <span className="text-xs font-bold text-primary">{formatCurrency(shop.total_billed || 0)}</span>
          </div>
        </div>

        {/* Contact & Territory Card */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Proprietor: <strong className="text-slate-900">{shop.owner_name || "N/A"}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-mono">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Phone: <strong className="text-slate-900">{shop.phone || "N/A"}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Route: <strong className="text-primary">{shop.route_name || "Unassigned Beat"}</strong></span>
          </div>
          {shop.address && (
            <div className="text-slate-600 pl-6 text-[11px]">
              Address: {shop.address} {shop.area ? `(${shop.area})` : ""}
            </div>
          )}
          {shop.gstin && (
            <div className="text-slate-500 pl-6 font-mono text-[11px]">
              GSTIN: {shop.gstin}
            </div>
          )}
        </div>

        {/* Udhar Balance & Limit */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <UdharLimitGauge
            currentBalance={shop.current_balance}
            creditLimit={shop.credit_limit}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(shop);
              }}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Edit Shop
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
