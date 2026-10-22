import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const dims = { sm: 24, md: 32, lg: 40, xl: 64 };
  const px = dims[size];
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center bg-violet-900/60 text-violet-300 font-semibold shrink-0 ring-1 ring-violet-500/20",
        size === "sm" && "w-6 h-6 text-[10px]",
        size === "md" && "w-8 h-8 text-sm",
        size === "lg" && "w-10 h-10 text-base",
        size === "xl" && "w-16 h-16 text-xl",
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name ?? "user"} width={px} height={px} className="object-cover w-full h-full" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
