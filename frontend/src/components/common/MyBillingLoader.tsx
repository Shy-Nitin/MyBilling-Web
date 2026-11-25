import React from "react";
import { Logo } from "./Logo";

interface MyBillingLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

/** Minimal branded loading animation replacing generic skeletons/spinners. */
export const MyBillingLoader: React.FC<MyBillingLoaderProps> = ({
  message = "Syncing workspace...",
  fullScreen = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen bg-surface" : "min-h-[55vh]"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-3 rounded-2xl bg-primary/15 animate-ping opacity-60" />
        <div className="relative w-14 h-14 rounded-2xl bg-white shadow-md border border-indigo-100 p-2 flex items-center justify-center">
          <Logo className="w-full h-full object-contain animate-pulse" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono text-secondary">
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default MyBillingLoader;
