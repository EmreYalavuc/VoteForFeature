import Link from "next/link";
import { UrlBar } from "@/components/products/url-bar";
import { Users, ArrowRight, Zap, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-20 text-center pt-10">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-violet-600/25 bg-violet-700/10 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-6 tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          Topluluk Platformu
        </div>
        <h1 className="animate-fade-up-delay-1 text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-50 mb-5 leading-[1.1]">
          Bir site{" "}
          <span className="galaxy-gradient">araştır</span>
          ,{" "}
          <br className="hidden sm:block" />
          topluluğa katıl
        </h1>
        <p className="animate-fade-up-delay-2 text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed font-light">
          Herhangi bir sitenin URL&apos;sini gir — aynı domain için yapılan tüm
          istekler ve yorumlar tek bir topluluk havuzunda buluşur.
        </p>
        <div className="animate-fade-up-delay-3">
          <UrlBar />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 mb-16" />

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-16">
        {[
          {
            icon: Zap,
            title: "Araştır",
            desc: "Bir sitenin URL'sini gir, o siteye ait tüm topluluğa ulaş.",
          },
          {
            icon: MessageSquare,
            title: "İstek Bırak",
            desc: "Feature request ekle, oyla, yorum yap — herkesin gördüğü ortak havuz.",
          },
          {
            icon: Users,
            title: "Community",
            desc: "Geliştiriciler kendi uygulamalarını listeler, topluluk test eder ve geri bildirim verir.",
          },
        ].map((f, i) => (
          <div
            key={f.title}
            className={`samsung-card p-6 animate-fade-up-delay-${i + 1}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700/20 mb-4">
              <f.icon className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="font-bold text-zinc-100 mb-2 text-lg">{f.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Community CTA */}
      <div className="rounded-2xl border border-white/6 bg-gradient-to-br from-violet-700/10 to-[#060810] p-8 text-center">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Uygulamanı topluluğa sun</h2>
        <p className="text-zinc-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
          Geliştirdiğin siteyi veya uygulamayı community ekranına ekle. Diğer geliştiriciler denesin, yorum bıraksın.
        </p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:bg-violet-500 hover:-translate-y-px"
        >
          Community&apos;ye Git <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
