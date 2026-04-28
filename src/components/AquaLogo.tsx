import { Droplet } from "lucide-react";

interface AquaLogoProps {
  size?: "sm" | "md" | "lg";
}

export function AquaLogo({ size = "md" }: AquaLogoProps) {
  const sizes = {
    sm: { icon: "h-5 w-5", text: "text-lg" },
    md: { icon: "h-6 w-6", text: "text-xl" },
    lg: { icon: "h-8 w-8", text: "text-2xl" },
  };
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Droplet
          className={`${sizes[size].icon} text-water fill-water/20`}
          strokeWidth={2}
        />
        <div className="absolute inset-0 blur-sm">
          <Droplet
            className={`${sizes[size].icon} text-leaf opacity-50`}
            strokeWidth={2}
          />
        </div>
      </div>
      <span className={`${sizes[size].text} font-bold tracking-tight text-foreground`}>
        Aqua<span className="text-leaf">Flow</span>
      </span>
    </div>
  );
}
