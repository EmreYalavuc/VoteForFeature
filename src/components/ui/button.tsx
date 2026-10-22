"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer tracking-wide",
          {
            "bg-violet-700 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/30 active:scale-[0.98] hover:-translate-y-px": variant === "default",
            "border border-violet-700 bg-transparent text-violet-400 hover:bg-violet-700/10 hover:text-white hover:border-violet-500": variant === "outline",
            "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100": variant === "ghost",
            "bg-red-600/90 text-white hover:bg-red-500 active:scale-[0.98]": variant === "destructive",
            "bg-zinc-800 text-zinc-200 hover:bg-zinc-700": variant === "secondary",
          },
          {
            "h-8 px-4 text-xs gap-1.5": size === "sm",
            "h-10 px-6 text-sm gap-2": size === "md",
            "h-12 px-8 text-base gap-2.5 tracking-wider": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
