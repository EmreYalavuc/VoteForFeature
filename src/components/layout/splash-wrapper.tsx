"use client";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/ui/splash-screen";

export function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "splash" | "done">("loading");

  useEffect(() => {
    const shown = sessionStorage.getItem("vff_intro");
    if (shown) {
      setState("done");
    } else {
      sessionStorage.setItem("vff_intro", "1");
      setState("splash");
    }
  }, []);

  return (
    <>
      {state === "splash" && (
        <SplashScreen onComplete={() => setState("done")} />
      )}
      <div
        style={{
          opacity:       state === "done" ? 1 : 0,
          transition:    state === "done" ? "opacity 0.5s ease" : "none",
          pointerEvents: state === "done" ? "auto" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
