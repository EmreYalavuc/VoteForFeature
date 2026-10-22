"use client";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-900/50 group-hover:bg-violet-500 transition-colors">
            <Zap className="h-4 w-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-zinc-100 tracking-tight">VoteForFeature</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
            Araştır
          </Link>
          {session && (
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800 transition-colors"
              >
                <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                <span className="hidden text-sm font-medium text-zinc-300 md:block">
                  {session.user?.name?.split(" ")[0]}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl shadow-black/50">
                  <div className="border-b border-zinc-800 px-3 py-2 mb-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">{session.user?.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{session.user?.email}</p>
                  </div>
                  <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => { setMenuOpen(false); signOut(); }}
                    className="flex w-full items-center px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={() => signIn()}>Sign in</Button>
          )}
        </div>
      </div>
    </header>
  );
}
