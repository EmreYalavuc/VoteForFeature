import { cn } from "@/lib/utils";
import Image from "next/image";
import BoringAvatar from "boring-avatars";

const PALETTE = ["#1428a0", "#3b57fe", "#9a9af8", "#60a5fa", "#eef4f9"];

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const dims = { sm: 24, md: 32, lg: 40, xl: 64 };
  const px = dims[size];

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden shrink-0 ring-1 ring-white/10",
        size === "sm" && "w-6 h-6",
        size === "md" && "w-8 h-8",
        size === "lg" && "w-10 h-10",
        size === "xl" && "w-16 h-16",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? "user"}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <BoringAvatar
          size={px}
          name={name ?? "?"}
          variant="beam"
          colors={PALETTE}
          square={false}
        />
      )}
    </div>
  );
}
