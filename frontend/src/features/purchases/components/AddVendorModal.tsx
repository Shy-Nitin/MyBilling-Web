import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { CreateSupplierPayload } from "../services/purchaseService";
import { Supplier } from "../../../types";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSupplierPayload) => Promise<void>;
  editSupplier?: Supplier | null;
}

export const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editSupplier,
}) => {
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [paymentTerms, setPaymentTerms] = useState(30);
  const [status, setStatus] = useState("Active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editSupplier) {
      setName(editSupplier.name);
      setContactPerson(editSupplier.contact_person || "");
      setPhone(editSupplier.phone || "");
      setEmail(editSupplier.email || "");
      setGstin(editSupplier.gstin || "");
      setAddress(editSupplier.address || "");
      setCity(editSupplier.city || "Mumbai");
      setPaymentTerms(editSupplier.payment_terms_days || 30);
      setStatus(editSupplier.status || "Active");
    } else {
      setName("");
      setContactPerson("");
      setPhone("");
      setEmail("");
      setGstin("");
      setAddress("");
      setCity("Mumbai");
      setPaymentTerms(30);
      setStatus("Active");
    }
  }, [editSupplier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter Supplier / Vendor Name.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        contact_person: contactPerson.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gstin: gstin.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        payment_terms_days: paymentTerms,
        status,
      });
      onClose();
    } catch (err: any) {
      alert(`Failed to save vendor: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSupplier ? "Edit Supplier Partner" : "Add Supplier / Vendor Partner"}
      subtitle={editSupplier ? "Update supplier contact information and payment terms." : "Configure wholesale procurement partner and payment credit terms."}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
            Vendor / Company Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Royal Agro Mills & Distributors Ltd."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Contact Person / Sales Manager
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Phone / Mobile Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98200 11223"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sales@royalagro.com"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              GSTIN Tax ID
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="27AABCR1234F1Z5"
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Warehouse / Factory Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot 45, APMC Industrial Zone"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Navi Mumbai"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Standard Credit Period (Days)
            </label>
            <input
              type="number"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(parseInt(e.target.value, 10) || 0)}
              className="w-full font-mono text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[11px] text-slate-500 uppercase block font-semibold mb-1">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
            {isSubmitting ? "Saving..." : editSupplier ? "Update Supplier" : "Register Vendor Partner"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
