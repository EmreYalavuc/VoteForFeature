"use client";
import { useEffect, useRef, useCallback } from "react";

const easeOut3  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn3   = (t: number) => t * t * t;
const easeOut5  = (t: number) => 1 - Math.pow(1 - t, 5);
const lerp      = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp     = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const prog      = (t: number, s: number, e: number) => clamp((t - s) / (e - s));

// Timeline (ms) — total ~2500ms
const TL = {
  prefixIn:  [0,   380],
  wordIn:    [300, 950],
  uGlow:     [950, 1100],
  uFall:     [1100, 1480],
  featureIn: [1380, 1750],
  shine:     [1750, 2150],
  fadeOut:   [2150, 2700],
} as const;

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef   = useRef(false);

  const run = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let start = 0;

    const BG    = "#0d1117";
    const PEARL = "#eef4f9";
    const BLUE  = "#60a5fa";

    function frame(ts: number) {
      if (!start) start = ts;
      const t = ts - start;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Canvas-level fade out
      let alpha = 1;
      if (t > TL.fadeOut[0]) {
        alpha = 1 - easeIn3(prog(t, TL.fadeOut[0], TL.fadeOut[1]));
      }
      if (alpha < 0.004 && !doneRef.current) {
        doneRef.current = true;
        cancelAnimationFrame(raf);
        onComplete();
        return;
      }

      const fs = clamp(W / 15.5, 32, 80);
      ctx.font = `800 ${fs}px Outfit, system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";

      const PREFIX  = "VoteFor";
      const FUTURE  = "Future";
      const FEATURE = "Feature";

      const pW  = ctx.measureText(PREFIX).width;
      const fuW = ctx.measureText(FUTURE).width;
      const feW = ctx.measureText(FEATURE).width;

      // Smooth x-center transition from "Future" → "Feature" width
      const xTransP = prog(t, TL.featureIn[0], TL.featureIn[1]);
      const xBlend  = easeOut3(xTransP);
      const futureStartX  = cx - (pW + fuW) / 2;
      const featureStartX = cx - (pW + feW) / 2;
      const baseX = lerp(futureStartX, featureStartX, xBlend);

      const showFeature = t >= TL.featureIn[0];

      // ── PREFIX "VoteFor" ──────────────────────────────────────────────
      const pIn  = easeOut3(prog(t, TL.prefixIn[0], TL.prefixIn[1]));
      const pOff = lerp(26, 0, easeOut5(prog(t, TL.prefixIn[0], TL.prefixIn[1])));

      ctx.globalAlpha = alpha * pIn;

      if (showFeature && prog(t, TL.shine[0], TL.shine[1]) > 0) {
        // Shine pass on prefix too
        const shineP = easeOut3(prog(t, TL.shine[0], TL.shine[1]));
        const shineAbs = baseX + lerp(-120, pW + feW + 120, shineP);
        const dist = Math.abs(baseX + pW / 2 - shineAbs);
        if (dist < 110) {
          const si = 1 - dist / 110;
          ctx.shadowBlur  = si * 20;
          ctx.shadowColor = "#93c5fd";
          ctx.fillStyle   = `rgba(255,255,255,${lerp(0.85, 1, si)})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle  = PEARL;
        }
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle  = PEARL;
      }

      ctx.fillText(PREFIX, baseX, cy + pOff * (1 - xBlend));
      ctx.shadowBlur = 0;

      const wordX = baseX + pW;

      if (!showFeature) {
        // ── FUTURE letters (type-in) ────────────────────────────────────
        const typeP     = prog(t, TL.wordIn[0], TL.wordIn[1]);
        const charsShow = Math.floor(typeP * FUTURE.length + 0.98);

        // Per-char x
        const futureXs: number[] = [];
        let cx2 = wordX;
        for (const ch of FUTURE) {
          futureXs.push(cx2);
          cx2 += ctx.measureText(ch).width;
        }

        // u fall physics (index 1 in "Future")
        const U = 1;
        const fallP = prog(t, TL.uFall[0], TL.uFall[1]);
        const uFallY   = fallP * fallP * H * 0.65;
        const uAlpha   = clamp(1 - fallP * 2.2);
        const uRot     = fallP * Math.PI * 0.55;

        for (let i = 0; i < Math.min(charsShow, FUTURE.length); i++) {
          const ch  = FUTURE[i];
          const chW = ctx.measureText(ch).width;
          const chX = futureXs[i];

          if (i === U) {
            if (uAlpha < 0.005) continue;

            ctx.save();

            // Glow before fall
            if (t >= TL.uGlow[0] && t < TL.uFall[0]) {
              const gp      = prog(t, TL.uGlow[0], TL.uFall[0]);
              const pulse   = Math.sin(gp * Math.PI * 5) * 0.5 + 0.5;
              ctx.shadowBlur  = pulse * 35;
              ctx.shadowColor = BLUE;
              ctx.fillStyle   = lerp(0, 1, pulse) > 0.4 ? BLUE : PEARL;
            } else {
              ctx.fillStyle = t >= TL.uFall[0] ? BLUE : PEARL;
            }

            ctx.globalAlpha = alpha * pIn * uAlpha;
            const ux = chX + chW / 2;
            const uy = cy + uFallY;
            ctx.translate(ux, uy);
            ctx.rotate(uRot);
            ctx.fillText(ch, -chW / 2, 0);
            ctx.shadowBlur = 0;
            ctx.restore();
          } else {
            ctx.globalAlpha = alpha * pIn;
            ctx.fillStyle   = PEARL;
            ctx.fillText(ch, chX, cy);
          }
        }

      } else {
        // ── FEATURE letters ────────────────────────────────────────────
        const feP = prog(t, TL.featureIn[0], TL.featureIn[1]);
        const shineP = easeOut3(prog(t, TL.shine[0], TL.shine[1]));
        const shineAbs = baseX + lerp(-120, pW + feW + 120, shineP);

        let chX = wordX;
        for (let i = 0; i < FEATURE.length; i++) {
          const ch  = FEATURE[i];
          const chW = ctx.measureText(ch).width;

          const delay  = i * 0.075;
          const charP  = clamp((feP - delay) / (1 - delay + 0.001));
          const charA  = easeOut3(charP);

          // 'e' (idx 1) and 'a' (idx 2) drop from above
          const isNew = i === 1 || i === 2;
          const charY = cy + (isNew ? lerp(-48, 0, easeOut5(charP)) : 0);

          // Shine
          const dist = Math.abs(chX + chW / 2 - shineAbs);
          if (shineP > 0 && dist < 90) {
            const si = 1 - dist / 90;
            ctx.shadowBlur  = si * 22;
            ctx.shadowColor = "#93c5fd";
            ctx.fillStyle   = `rgba(255,255,255,${lerp(0.85, 1, si)})`;
          } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle  = PEARL;
          }

          ctx.globalAlpha = alpha * charA;
          ctx.fillText(ch, chX, charY);
          ctx.shadowBlur = 0;
          chX += chW;
        }
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    let cleanup: (() => void) | undefined;
    document.fonts.ready.then(() => { cleanup = run(canvas); });
    return () => cleanup?.();
  }, [run]);

  return (
    <div className="fixed inset-0 z-[200]">
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
