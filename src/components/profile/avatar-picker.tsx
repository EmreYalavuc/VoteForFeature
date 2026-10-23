"use client";
import { useState } from "react";
import Image from "next/image";
import { Camera, Check, X, Link as LinkIcon } from "lucide-react";
import BoringAvatar from "boring-avatars";

const PALETTE = ["#1428a0", "#3b57fe", "#9a9af8", "#60a5fa", "#eef4f9"];

const DICEBEAR_STYLES = [
  "avataaars", "bottts", "fun-emoji", "pixel-art",
  "shapes", "identicon", "rings", "thumbs",
];

const SEEDS = ["Alpha", "Beta", "Nova", "Zeta", "Orion", "Luna", "Vega", "Sol"];

function dicebearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&radius=50&size=80`;
}

interface AvatarPickerProps {
  userId: string;
  currentImage?: string | null;
  userName?: string | null;
}

export function AvatarPicker({ userId, currentImage, userName }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [tab, setTab] = useState<"presets" | "url">("presets");
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(currentImage);

  const previewUrl = tab === "url" ? customUrl : selected;

  async function save() {
    const url = tab === "url" ? customUrl.trim() : selected;
    if (!url) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (res.ok) {
        setCurrent(url);
        setOpen(false);
        setSelected(null);
        setCustomUrl("");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Avatar trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="group relative"
        title="Avatar değiştir"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-white/10">
          {current ? (
            <Image src={current} alt={userName ?? "avatar"} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <BoringAvatar size={64} name={userName ?? "?"} variant="beam" colors={PALETTE} />
          )}
        </div>
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0d1117] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-100">Avatar seç</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 rounded-lg bg-zinc-900 p-1">
              {(["presets", "url"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                    tab === t ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                  }`}>
                  {t === "presets" ? "Hazır Avatarlar" : "URL ile"}
                </button>
              ))}
            </div>

            {tab === "presets" ? (
              <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                {/* Boring avatars variants */}
                {(["beam", "marble", "ring", "sunset", "bauhaus", "pixel", "geometric", "abstract"] as const).map((variant) => {
                  const id = `boring-${variant}`;
                  const isSelected = selected === id;
                  return (
                    <button key={id} onClick={() => setSelected(isSelected ? null : id)}
                      className={`relative rounded-xl overflow-hidden ring-2 transition-all ${
                        isSelected ? "ring-violet-500" : "ring-transparent hover:ring-zinc-600"
                      }`}>
                      <BoringAvatar size={72} name={userName ?? "user"} variant={variant} colors={PALETTE} square />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-violet-500/30">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
                {/* DiceBear presets */}
                {DICEBEAR_STYLES.map((style) => {
                  const seed = SEEDS[DICEBEAR_STYLES.indexOf(style)];
                  const url = dicebearUrl(style, userName ?? seed);
                  const isSelected = selected === url;
                  return (
                    <button key={style} onClick={() => setSelected(isSelected ? null : url)}
                      className={`relative rounded-xl overflow-hidden ring-2 transition-all ${
                        isSelected ? "ring-violet-500" : "ring-transparent hover:ring-zinc-600"
                      }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={style} className="w-[72px] h-[72px] object-cover bg-zinc-800" />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-violet-500/30">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5">
                  <LinkIcon className="h-4 w-4 text-zinc-500 shrink-0" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
                  />
                </div>
                {customUrl && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customUrl} alt="preview" className="w-20 h-20 rounded-full object-cover ring-2 ring-violet-500/40 bg-zinc-800" />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-800">
              <span className="text-xs text-zinc-600">
                {previewUrl ? "Seçildi" : "Bir avatar seçin"}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)}
                  className="rounded-lg border border-zinc-700 px-4 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 transition-all">
                  İptal
                </button>
                <button onClick={save} disabled={saving || !previewUrl}
                  className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm text-white hover:bg-violet-500 transition-all disabled:opacity-40">
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
