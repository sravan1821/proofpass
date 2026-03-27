import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--primary)] px-5 py-3 text-white shadow-[0_18px_45px_rgba(67,56,202,0.28)] hover:-translate-y-0.5 hover:bg-[color:var(--primary-strong)]",
        secondary: "border border-white/15 bg-white/8 px-5 py-3 text-[color:var(--foreground)] hover:bg-white/12",
        ghost: "px-4 py-2 text-[color:var(--muted-foreground)] hover:bg-white/6 hover:text-[color:var(--foreground)]",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
