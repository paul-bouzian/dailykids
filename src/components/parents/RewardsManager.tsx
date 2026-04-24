"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "motion/react";
import { Plus, Star, Trash2 } from "lucide-react";
import { db, type Reward } from "@/lib/db";
import { StackHeader } from "./StackHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";

const REWARD_EMOJIS = ["🍭", "🍦", "🎁", "📺", "🎮", "🛝", "🎨", "🚲", "🧸", "🎬", "🍕", "🏊"];

export function RewardsManager({ back }: { back: () => void }) {
  const rewards = useLiveQuery(() => db.rewards.toArray());
  const [editing, setEditing] = useState<Reward | "new" | null>(null);

  if (!rewards) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StackHeader
        title="Récompenses"
        back={back}
        right={
          <button
            onClick={() => setEditing("new")}
            className="size-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 text-white shadow-lg flex items-center justify-center active:scale-95"
            aria-label="Ajouter"
          >
            <Plus className="size-5" strokeWidth={3} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {rewards.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-3">✨</div>
            <p>Aucune récompense. Appuie sur + pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rewards.map((r) => (
              <button
                key={r.id}
                onClick={() => setEditing(r)}
                className="w-full flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm text-left active:scale-[0.99]"
              >
                <div className="text-3xl">{r.emoji}</div>
                <div className="flex-1 font-bold text-slate-800">{r.label}</div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="size-4 fill-amber-400 text-amber-400" strokeWidth={2.5} />
                  {r.starsCost}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {editing && (
        <RewardEditor
          reward={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RewardEditor({
  reward,
  onClose,
}: {
  reward: Reward | null;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(reward?.label ?? "");
  const [emoji, setEmoji] = useState(reward?.emoji ?? REWARD_EMOJIS[0]);
  const [cost, setCost] = useState(reward?.starsCost ?? 5);

  const save = async () => {
    if (!label.trim()) return;
    if (reward) {
      await db.rewards.update(reward.id!, { label: label.trim(), emoji, starsCost: cost });
    } else {
      await db.rewards.add({ label: label.trim(), emoji, starsCost: cost });
    }
    onClose();
  };

  const remove = async () => {
    if (!reward) return;
    await db.rewards.delete(reward.id!);
    onClose();
  };

  return (
    <BottomSheet onClose={onClose} title={reward ? "Modifier" : "Nouvelle récompense"}>
      <div className="px-5 pb-6 space-y-4">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nom de la récompense"
          className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300"
          autoFocus
        />

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">EMOJI</label>
          <div className="grid grid-cols-6 gap-1.5">
            {REWARD_EMOJIS.map((m) => (
              <button
                key={m}
                onClick={() => setEmoji(m)}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition ${
                  emoji === m ? "bg-amber-100 ring-2 ring-amber-400" : "bg-slate-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 mb-2 block">
            COÛT EN ÉTOILES : {cost}
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={!label.trim()}
          className="w-full rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-400 text-white font-bold py-3.5 shadow-lg disabled:opacity-50"
        >
          {reward ? "Enregistrer" : "Créer"}
        </motion.button>

        {reward && (
          <button
            onClick={remove}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-600 font-bold py-3"
          >
            <Trash2 className="size-4" /> Supprimer
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
