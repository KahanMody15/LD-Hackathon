import { useEffect, useRef } from "react";

interface MiniHeatmapProps {
  region: string;
}

export function MiniHeatmap({ region }: MiniHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Seed variations per region
    let seedNodeCount = 12;
    let seedIntensityMultiplier = 1;
    let mainColor = "16, 185, 129"; // emerald-500
    let hazardColor = "239, 68, 68"; // red-500

    if (region === "Ahmedabad") {
      seedNodeCount = 18;
      seedIntensityMultiplier = 1.4;
      mainColor = "234, 179, 8"; // yellow-500
    } else if (region === "Surat") {
      seedNodeCount = 15;
      seedIntensityMultiplier = 1.2;
      mainColor = "16, 185, 129"; // emerald
      hazardColor = "249, 115, 22"; // orange-500
    } else if (region === "Vadodara") {
      seedNodeCount = 10;
      seedIntensityMultiplier = 0.8;
      mainColor = "59, 130, 246"; // blue-500
    }

    const nodes = Array.from({ length: seedNodeCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: (Math.random() * 30 + 20) * seedIntensityMultiplier,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
      isHazard: Math.random() > 0.8,
    }));

    const render = () => {
      // Clear with dark transparent
      ctx.fillStyle = "rgba(24, 24, 27, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "lighter";

      nodes.forEach((node) => {
        // slight drift
        node.x += Math.sin(time * node.speed + node.phase) * 0.5;
        node.y += Math.cos(time * node.speed + node.phase) * 0.5;

        // Wrap around bounds softly
        if (node.x < -50) node.x = canvas.width + 50;
        if (node.x > canvas.width + 50) node.x = -50;
        if (node.y < -50) node.y = canvas.height + 50;
        if (node.y > canvas.height + 50) node.y = -50;

        const pulse = Math.sin(time * node.speed * 2 + node.phase) * 0.2 + 0.8;
        const currentRadius = node.radius * pulse;

        const colorParts = node.isHazard ? hazardColor : mainColor;

        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          currentRadius
        );
        gradient.addColorStop(0, `rgba(${colorParts}, 0.6)`);
        gradient.addColorStop(0.5, `rgba(${colorParts}, 0.2)`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      time++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [region]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover rounded-xl"
      width={600}
      height={200}
    />
  );
}
