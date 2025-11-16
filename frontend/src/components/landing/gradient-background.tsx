import { cn } from "@/lib/utils";

type GradientVariant = "radial" | "diagonal" | "vertical" | "mesh" | "dual-radial";

interface GradientBackgroundProps {
  variant?: GradientVariant;
  className?: string;
  opacity?: number;
}

export function GradientBackground({
  variant = "radial",
  className,
  opacity = 1,
}: GradientBackgroundProps) {
  const gradients = {
    radial: "bg-[radial-gradient(circle_at_top,hsl(141,73%,42%,0.25)_0%,transparent_60%)]",
    diagonal: "bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15",
    vertical: "bg-gradient-to-b from-background via-primary/20 to-background",
    mesh: "bg-[radial-gradient(at_20%_30%,hsla(141,73%,42%,0.3)_0px,transparent_50%),radial-gradient(at_80%_70%,hsla(141,73%,60%,0.25)_0px,transparent_50%)]",
    "dual-radial":
      "bg-[radial-gradient(circle_at_30%_20%,hsla(141,73%,42%,0.25)_0px,transparent_50%),radial-gradient(circle_at_70%_80%,hsla(141,73%,52%,0.2)_0px,transparent_50%)]",
  };

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none -z-10", gradients[variant], className)}
      style={{ opacity }}
    />
  );
}
