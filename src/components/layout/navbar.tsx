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
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-700 shadow-lg shadow-violet-900/40 group-hover:bg-violet-500 transition-colors duration-300">
            <Zap className="h-4 w-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-zinc-50 tracking-tight text-sm">VoteForFeature</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          <Link href="/"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all duration-200 tracking-wide">
            Araştır
          </Link>
          <Link href="/community"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all duration-200 tracking-wide">
            Community
          </Link>
          {session && (
            <Link href="/dashboard"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all duration-200 tracking-wide">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/5 transition-colors duration-200"
              >
                <Avatar src={session.user?.image} name={session.user?.name} size="sm" />
                <span className="hidden text-sm font-medium text-zinc-300 md:block">
                  {session.user?.name?.split(" ")[0]}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/8 bg-[#0d1020] py-1.5 shadow-2xl shadow-black/60">
                  <div className="border-b border-white/6 px-4 py-2.5 mb-1">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{session.user?.name}</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <Link href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-zinc-100 transition-colors duration-150"
                    onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => { setMenuOpen(false); signOut(); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-red-400 transition-colors duration-150">
                    Çıkış yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={() => signIn()}>Giriş Yap</Button>
          )}
        </div>
      </div>
    </header>
  );
}
