import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";

/** Interactive 404 page inspired by classic tracking-eyes minimalism. */
export const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<SVGCircleElement>(null);
  const rightEyeRef = useRef<SVGCircleElement>(null);

  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const calcOffset = (eyeEl: SVGCircleElement | null, clientX: number, clientY: number) => {
      if (!eyeEl) return { x: 0, y: 0 };
      const rect = eyeEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const angle = Math.atan2(dy, dx);
      // Max pupil travel inside 42-radius eye with 14-radius pupil
      const dist = Math.min(18, Math.hypot(dx, dy) / 14);
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      setLeftPupil(calcOffset(leftEyeRef.current, e.clientX, e.clientY));
      setRightPupil(calcOffset(rightEyeRef.current, e.clientX, e.clientY));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        setLeftPupil(calcOffset(leftEyeRef.current, e.touches[0].clientX, e.touches[0].clientY));
        setRightPupil(calcOffset(rightEyeRef.current, e.touches[0].clientX, e.touches[0].clientY));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-surface text-on-surface flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden relative"
    >
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo className="w-8 h-8 rounded-lg" />
          <span className="font-headline-sm text-lg font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">
            MyBilling
          </span>
        </Link>
        <span className="font-label-mono-sm text-xs px-2.5 py-1 rounded-full bg-surface-container-high text-text-secondary">
          ERROR 404
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto text-center py-8 z-10">
        <div className="w-full text-left mb-10 md:mb-14">
          <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight max-w-xl">
            Uh oh, the page you’re looking for can’t be found.
          </h1>
          <p className="mt-3 text-sm md:text-base text-text-muted max-w-md">
            Move your cursor around — even we’re looking everywhere for this route.
          </p>
        </div>

        {/* Interactive Tracking Eyes SVG */}
        <div className="my-4 md:my-6 flex items-center justify-center">
          <svg
            width="240"
            height="140"
            viewBox="0 0 240 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Interactive eyes looking at your cursor"
            className="drop-shadow-xs"
          >
            {/* Left Eyebrow */}
            <path
              d="M26 28 Q 62 10 98 28"
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eyebrow */}
            <path
              d="M142 28 Q 178 10 214 28"
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />

            {/* Left Eye */}
            <circle
              ref={leftEyeRef}
              cx="62"
              cy="82"
              r="44"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="6.5"
            />
            <circle
              cx={62 + leftPupil.x}
              cy={82 + leftPupil.y}
              r="15"
              fill="#1E293B"
              className="transition-transform duration-75 ease-out"
            />
            <circle
              cx={62 + leftPupil.x + 4}
              cy={82 + leftPupil.y - 4}
              r="3.5"
              fill="#FFFFFF"
            />

            {/* Right Eye */}
            <circle
              ref={rightEyeRef}
              cx="178"
              cy="82"
              r="44"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="6.5"
            />
            <circle
              cx={178 + rightPupil.x}
              cy={82 + rightPupil.y}
              r="15"
              fill="#1E293B"
              className="transition-transform duration-75 ease-out"
            />
            <circle
              cx={178 + rightPupil.x + 4}
              cy={82 + rightPupil.y - 4}
              r="3.5"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Navigation Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold shadow-sm hover:bg-secondary transition-all active:scale-[0.98]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          )}
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] ${
              isAuthenticated
                ? "bg-surface-container-low border border-border-strong text-on-surface hover:bg-surface-container"
                : "bg-primary text-on-primary shadow-sm hover:bg-secondary"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-text-muted">
        MyBilling &bull; Precision Billing &amp; Distribution OS
      </footer>
    </div>
  );
};

export default NotFoundPage;
