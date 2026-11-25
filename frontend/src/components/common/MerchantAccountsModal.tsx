import React, { useEffect, useState } from "react";
import { Users, X, ArrowRight, ShieldCheck, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import { apiClient } from "@/services/api/apiClient";
import { useAuth, User } from "@/context/AuthContext";

interface MerchantAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MerchantAccountsModal: React.FC<MerchantAccountsModalProps> = ({ isOpen, onClose }) => {
  const { user: currentUser, activeWorkspace, switchWorkspace } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<User[]>("/admin/users");
      setUsers(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectWorkspace = (targetUser: User) => {
    switchWorkspace(targetUser);
    onClose();
  };

  const handleExitToSelf = () => {
    switchWorkspace(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline-sm font-bold text-slate-900 text-base">
                Merchant Accounts & Workspaces
              </h3>
              <p className="font-body-sm text-slate-500 text-xs mt-0.5">
                Master Admin Portal — Select an individual merchant to open their isolated workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar for switching back */}
        <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
          <span className="font-medium">
            Currently active context:{" "}
            <span className="font-bold underline">
              {activeWorkspace ? activeWorkspace.business_name || activeWorkspace.full_name : "Master Admin's Own Workspace"}
            </span>
          </span>
          {activeWorkspace && (
            <button
              onClick={handleExitToSelf}
              className="px-2.5 py-1 bg-amber-600 text-white rounded font-semibold hover:bg-amber-700 transition-colors shadow-xs"
            >
              Reset to My Workspace
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Loading merchant directories...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-red-600 bg-red-50 rounded-xl p-4">
              {error}
            </div>
          ) : (
            users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              const isCurrentActive = activeWorkspace ? activeWorkspace.id === u.id : isSelf;

              return (
                <div
                  key={u.id}
                  className={`py-3.5 px-3 flex items-center justify-between rounded-xl transition-colors ${
                    isCurrentActive ? "bg-primary/5 border border-primary/20" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                        u.role === "master_admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {u.business_name || u.full_name}
                        </span>
                        {u.role === "master_admin" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                            Master Admin
                          </span>
                        )}
                        {!u.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 font-semibold border border-red-200">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {u.email} • ID #{u.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrentActive ? (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active Workspace
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectWorkspace(u)}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-primary rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
