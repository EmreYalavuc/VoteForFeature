"use client";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface BioEditorProps {
  initialBio: string;
  userId: string;
}

export function BioEditor({ initialBio, userId }: BioEditorProps) {
  const [bio, setBio] = useState(initialBio);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialBio);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}/bio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: draft }),
      });
      if (res.ok) {
        setBio(draft);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(bio);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={500}
          autoFocus
          placeholder="Kendinizi tanıtın — hangi alanlardasınız, ne tür uygulamalar kullanıyorsunuz?"
          className="w-full rounded-lg border border-violet-500/40 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-violet-500/40 resize-none transition-colors"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600/15 border border-violet-500/30 px-3 py-1.5 text-xs text-violet-400 hover:bg-violet-600/25 transition-all disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 transition-all"
          >
            <X className="h-3.5 w-3.5" />
            İptal
          </button>
          <span className="text-xs text-zinc-700 ml-auto">{draft.length}/500</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2">
      {bio ? (
        <p className="text-sm text-zinc-400 leading-relaxed flex-1">{bio}</p>
      ) : (
        <p className="text-sm text-zinc-600 italic flex-1">Henüz biyografi eklenmedi.</p>
      )}
      <button
        onClick={() => { setDraft(bio); setEditing(true); }}
        className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all shrink-0"
        title="Biyografiyi düzenle"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
