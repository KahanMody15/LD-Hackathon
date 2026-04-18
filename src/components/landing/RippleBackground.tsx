import { cn } from "@/lib/utils";

interface RippleBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RippleBackground({ className, ...props }: RippleBackgroundProps) {
  return (
    <div className={cn("absolute inset-0 z-0 overflow-hidden", className)} {...props}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary-500/20 animate-ripple"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary-500/30 animate-ripple" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary-500/40 animate-ripple" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-primary-500/50 animate-ripple" style={{ animationDelay: '1.5s' }}></div>
    </div>
  );
}
