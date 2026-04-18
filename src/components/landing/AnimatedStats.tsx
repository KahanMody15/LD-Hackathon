import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedStatsProps {
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedStats({ value, label, suffix = '', duration = 2 }: AnimatedStatsProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const incrementTime = (duration * 1000) / end;
      
      const timer = setInterval(() => {
        start += Math.ceil(end / 50);
        if (start > end) start = end;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [value, duration, isInView]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-4">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono">
        {count}{suffix}
      </div>
      <div className="text-sm md:text-base text-slate-400 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
