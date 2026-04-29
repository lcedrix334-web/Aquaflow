import { jsxs, jsx } from "react/jsx-runtime";
import { Droplet } from "lucide-react";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function AquaLogo({ size = "md" }) {
  const sizes = {
    sm: { icon: "h-5 w-5", text: "text-lg" },
    md: { icon: "h-6 w-6", text: "text-xl" },
    lg: { icon: "h-8 w-8", text: "text-2xl" }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        Droplet,
        {
          className: `${sizes[size].icon} text-water fill-water/20`,
          strokeWidth: 2
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 blur-sm", children: /* @__PURE__ */ jsx(
        Droplet,
        {
          className: `${sizes[size].icon} text-leaf opacity-50`,
          strokeWidth: 2
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: `${sizes[size].text} font-bold tracking-tight text-foreground`, children: [
      "Aqua",
      /* @__PURE__ */ jsx("span", { className: "text-leaf", children: "Flow" })
    ] })
  ] });
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        leaf: "bg-leaf text-leaf-foreground font-semibold shadow-[0_0_24px_-6px_oklch(0.78_0.19_152/0.6)] hover:bg-leaf/90 hover:shadow-[0_0_36px_-4px_oklch(0.78_0.19_152/0.8)] transition-shadow",
        water: "bg-water text-water-foreground font-semibold shadow-[0_0_24px_-6px_oklch(0.72_0.16_230/0.6)] hover:bg-water/90 transition-shadow",
        hero: "bg-gradient-to-br from-leaf to-water text-primary-foreground font-semibold shadow-[0_0_30px_-4px_oklch(0.78_0.19_152/0.5)] hover:shadow-[0_0_40px_-2px_oklch(0.72_0.16_230/0.7)] transition-shadow"
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3.5 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
export {
  AquaLogo as A,
  Button as B,
  cn as c
};
