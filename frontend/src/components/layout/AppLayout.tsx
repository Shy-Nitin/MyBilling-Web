import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { HotkeyDock } from "./HotkeyDock";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, UserCircle2 } from "lucide-react";

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onQuickAction: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath,
  onNavigate,
  onQuickAction,
  children,
}) => {
  const { isSwitchedWorkspace, activeWorkspace, switchWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [playfulMode, setPlayfulMode] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 400);
  };

  const handleExitWorkspace = () => {
    switchWorkspace(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased">
      {/* Fixed Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        playfulMode={playfulMode}
        onTogglePlayfulMode={() => setPlayfulMode(!playfulMode)}
      />

      {/* Main Content Area offset by Sidebar (256px) and Header (64px) */}
      <div className="pl-64 flex flex-col min-h-screen">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          onQuickAction={onQuickAction}
          isRefreshing={isRefreshing}
        />

        <main className="relative pt-16 bg-background w-full min-h-screen p-space-xl">
          {/* Master Admin Workspace Switcher Alert */}
          {isSwitchedWorkspace && activeWorkspace && (
            <div className="mb-6 p-3 px-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-950">
                      Viewing Merchant Workspace:
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
                      {activeWorkspace.business_name || activeWorkspace.full_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5 font-mono">
                    {activeWorkspace.email} • ID #{activeWorkspace.id} • All data & billing operations are scoped to this merchant account.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExitWorkspace}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to My Workspace</span>
              </button>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Domain POS Hotkey Dock */}
      <HotkeyDock />
    </div>
  );
};
