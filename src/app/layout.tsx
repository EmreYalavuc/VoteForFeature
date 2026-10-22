import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { SessionProvider } from "next-auth/react";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "VoteForFeature — Community Feature Voting",
  description: "Submit, vote, and track feature requests across products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <SessionProvider>
          <div className="min-h-screen bg-[#09090b]">
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
