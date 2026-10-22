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
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
          {
            "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/30 active:scale-95": variant === "default",
            "border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-600": variant === "outline",
            "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100": variant === "ghost",
            "bg-red-600/90 text-white hover:bg-red-500": variant === "destructive",
            "bg-zinc-800 text-zinc-200 hover:bg-zinc-700": variant === "secondary",
          },
          {
            "h-7 px-3 text-xs gap-1": size === "sm",
            "h-9 px-4 text-sm gap-1.5": size === "md",
            "h-11 px-6 text-base gap-2": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
