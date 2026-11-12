import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Loader2, Check } from "lucide-react";
import { Modal } from "../../../components/common/Modal";
import { Route } from "../../../types";
import { routeService } from "../services/routeService";

interface ManageRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoutesChanged?: () => void;
}

export const ManageRoutesModal: React.FC<ManageRoutesModalProps> = ({
  isOpen,
  onClose,
  onRoutesChanged,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRoutes();
    }
  }, [isOpen]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routeService.getRoutes();
      setRoutes(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load delivery routes.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (rt: Route) => {
    setEditingId(rt.id);
    setName(rt.name);
    setCode(rt.code || "");
    setDescription(rt.description || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setDescription("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      setError(null);
      if (editingId) {
        await routeService.updateRoute(editingId, {
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
        });
      } else {
        await routeService.createRoute({
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
        });
      }
      handleCancelEdit();
      await loadRoutes();
      if (onRoutesChanged) onRoutesChanged();
    } catch (err: any) {
      setError(err?.message || "Failed to save delivery route.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rt: Route) => {
    if (
      !confirm(
        `Are you sure you want to delete route '${rt.name}'? Shops currently assigned to this route will become unassigned, but will NOT be deleted.`
      )
    ) {
      return;
    }
    try {
      await routeService.deleteRoute(rt.id);
      await loadRoutes();
      if (onRoutesChanged) onRoutesChanged();
    } catch (err: any) {
      alert(err?.message || "Failed to delete route.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delivery & Sales Routes"
      subtitle="Organize outlet beats, delivery schedules, and salesperson territories."
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Route Form */}
        <form onSubmit={handleSave} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{editingId ? "Edit Delivery Route" : "Add New Delivery Route"}</span>
            </span>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Cancel
              </button>
            )}
          </div>

          {error && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                Route Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Market Yard - Sector 18"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                Route Code
              </label>
              <input
                type="text"
                placeholder="e.g. RT-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
              Description / Areas Covered
            </label>
            <input
              type="text"
              placeholder="e.g. APMC wholesale fruit market and retail lanes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : editingId ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Route</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Route</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Existing Routes List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 text-[11px] font-mono text-slate-600 font-semibold uppercase flex justify-between">
            <span>Configured Delivery Routes ({routes.length})</span>
            <span>Shops Assigned</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading delivery routes...</span>
              </div>
            ) : routes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No delivery routes found. Add your first route above.
              </div>
            ) : (
              routes.map((rt) => (
                <div key={rt.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{rt.name}</span>
                      {rt.code && (
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                          {rt.code}
                        </span>
                      )}
                    </div>
                    {rt.description && <span className="text-[11px] text-slate-500">{rt.description}</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {rt.shop_count || 0} shops
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditClick(rt)}
                        className="p-1 rounded hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors"
                        title="Edit Route"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(rt)}
                        className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Route"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
