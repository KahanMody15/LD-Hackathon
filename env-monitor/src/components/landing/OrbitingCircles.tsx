import React from "react";
import { cn } from "@/lib/utils";

interface OrbitingCirclesProps {
  className?: string;
  radius?: number;
  speed?: number;
  children: React.ReactNode;
}

export function OrbitingCircles({
  className,
  radius = 150,
  speed = 1,
  children,
}: OrbitingCirclesProps) {
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center animate-orbit",
        className
      )}
      style={
        {
          animationDuration: `${20 / speed}s`,
          transform: `translateX(${radius}px)`, 
        } as React.CSSProperties
      }
    >
      <div 
        className="animate-orbit" 
        style={{
          animationDuration: `${20 / speed}s`,
          animationDirection: 'reverse'
        }}>
        {children}
      </div>
    </div>
  );
}
