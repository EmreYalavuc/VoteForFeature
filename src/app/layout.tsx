import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { SplashWrapper } from "@/components/layout/splash-wrapper";
import { SessionProvider } from "next-auth/react";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoteForFeature — Community Feature Voting",
  description: "Bir sitenin URL'sini gir, toplulukla buluş. Feature request ve geri bildirimler ortak havuzda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={outfit.variable}>
      <body>
        <SessionProvider>
          <SplashWrapper>
            <div className="min-h-screen bg-[#0d1117]">
              <Navbar />
              <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
            </div>
          </SplashWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
