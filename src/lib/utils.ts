import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FeatureStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export const STATUS_LABELS: Record<FeatureStatus, string> = {
  PENDING: "Pending",
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  DONE: "Shipped",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<FeatureStatus, string> = {
  PENDING:    "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  PLANNED:    "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
  IN_PROGRESS:"bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20",
  DONE:       "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  REJECTED:   "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
};

export const STATUS_DOT: Record<FeatureStatus, string> = {
  PENDING:    "bg-amber-400",
  PLANNED:    "bg-blue-400",
  IN_PROGRESS:"bg-violet-400",
  DONE:       "bg-emerald-400",
  REJECTED:   "bg-red-400",
};

export const FEATURE_CATEGORIES = [
  "general", "ui", "performance", "security",
  "integrations", "mobile", "api", "docs",
];

export const CATEGORIES = FEATURE_CATEGORIES;

export type Rank = {
  label: string;
  emoji: string;
  color: string; // tailwind text color class
  bg: string;    // tailwind bg class
  score: number;
  next: number | null;
};

export function calculateRank(stats: { likes: number; dislikes: number; reviewCount: number }): Rank {
  const score = stats.likes * 3 - stats.dislikes + stats.reviewCount;
  if (score >= 150) return { label: "Elite",     emoji: "💎", color: "text-purple-300",  bg: "bg-purple-500/15 border-purple-500/30",   score, next: null };
  if (score >= 75)  return { label: "Expert",    emoji: "🔶", color: "text-amber-300",   bg: "bg-amber-500/15  border-amber-500/30",    score, next: 150 };
  if (score >= 30)  return { label: "Trusted",   emoji: "🌟", color: "text-violet-300",  bg: "bg-violet-500/15 border-violet-500/30",   score, next: 75 };
  if (score >= 10)  return { label: "Reviewer",  emoji: "🟢", color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/30", score, next: 30 };
  return              { label: "Newcomer",   emoji: "🔵", color: "text-blue-300",    bg: "bg-blue-500/15   border-blue-500/30",    score, next: 10 };
}

export const PRODUCT_CATEGORIES = [
  { value: "WEB",     label: "Web App",    emoji: "🌐" },
  { value: "MOBILE",  label: "Mobile",     emoji: "📱" },
  { value: "DESKTOP", label: "Desktop",    emoji: "🖥️" },
  { value: "GAME",    label: "Game",       emoji: "🎮" },
  { value: "API",     label: "API",        emoji: "⚡" },
  { value: "TOOL",    label: "Tool",       emoji: "🔧" },
  { value: "DEVTOOL", label: "Dev Tool",   emoji: "👨‍💻" },
  { value: "OTHER",   label: "Community",  emoji: "💬" },
] as const;

export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.toLowerCase().replace(/^www\./, "").split("/")[0];
  }
}

export function domainToSlug(domain: string): string {
  return domain.replace(/\./g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function domainToName(domain: string): string {
  const base = domain.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export const TECH_STACK_OPTIONS = [
  "Next.js", "React", "Vue", "Angular", "Svelte", "Nuxt",
  "Node.js", "Express", "Fastify", "NestJS",
  "Python", "Django", "FastAPI", "Flask",
  "Go", "Rust", "Java", "Spring", ".NET",
  "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis",
  "TypeScript", "JavaScript",
  "Tailwind", "shadcn/ui",
  "Docker", "Kubernetes",
  "AWS", "Vercel", "Supabase",
  "React Native", "Flutter", "Swift", "Kotlin",
  "Unity", "Unreal",
];
