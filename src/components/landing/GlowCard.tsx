import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, children, ...props }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
      <div
        ref={ref || divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className={cn(
          "relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.05), transparent 40%)`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
GlowCard.displayName = "GlowCard";
