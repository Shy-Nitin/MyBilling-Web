import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { CreateShopPayload } from "../services/shopService";
import { Shop, Route } from "../../../types";

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateShopPayload) => Promise<void>;
  editShop?: Shop | null;
  routes?: Route[];
}

export const AddShopModal: React.FC<AddShopModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editShop,
  routes = [],
}) => {
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const [creditLimit, setCreditLimit] = useState(50000);
  const [tier, setTier] = useState("Standard");
  const [status, setStatus] = useState("Active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editShop) {
      setName(editShop.name);
      setOwnerName(editShop.owner_name || "");
      setPhone(editShop.phone || "");
      setGstin(editShop.gstin || "");
      setAddress(editShop.address || "");
      setArea(editShop.area || "");
      setRouteId(editShop.route_id || undefined);
      setCreditLimit(editShop.credit_limit);
      setTier(editShop.tier || "Standard");
      setStatus(editShop.status || "Active");
    } else {
      setName("");
      setOwnerName("");
      setPhone("");
      setGstin("");
      setAddress("");
      setArea("");
      setRouteId(undefined);
      setCreditLimit(50000);
      setTier("Standard");
      setStatus("Active");
    }
  }, [editShop, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter the Shop name.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        owner_name: ownerName.trim() || undefined,
        phone: phone.trim() || undefined,
        gstin: gstin.trim() || undefined,
        address: address.trim() || undefined,
        area: area.trim() || undefined,
        route_id: routeId,
        credit_limit: creditLimit,
        tier,
        status,
      });
      onClose();
    } catch (err: any) {
      alert(`Failed to save shop: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editShop ? "Edit Shop Account" : "Register New Shop / Udhar Account"}
      subtitle={editShop ? "Update proprietor identity, delivery beat, and credit limits." : "Establish customer credit limit, GSTIN identity, and route."}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
            Shop / Business Enterprise Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Laxmi Supermarket & General Store"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Proprietor / Owner Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Mobile / Contact Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98200 99887"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Delivery / Sales Route
            </label>
            <select
              value={routeId || ""}
              onChange={(e) => setRouteId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="">-- No Route Assigned --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.code ? `(${r.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Locality / Area
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Sector 18, APMC"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
            Physical Shop Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop #12, Market Yard Main Road"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Credit Limit (₹)
            </label>
            <input
              type="number"
              step="5000"
              value={creditLimit}
              onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Trade Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="Retailer">Retailer</option>
              <option value="Standard">Standard</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="VIP Key Account">VIP Key Account</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="Active">Active</option>
              <option value="Warning">Warning</option>
              <option value="Blocked">Blocked</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary-container hover:bg-primary rounded shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : editShop ? "Update Shop" : "Confirm Registration"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
