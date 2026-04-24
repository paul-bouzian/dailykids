"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Delete, Lock } from "lucide-react";
import { db } from "@/lib/db";

export function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);

  useEffect(() => {
    db.settings.get(1).then((s) => setStoredPin(s?.pin ?? "0000"));
  }, []);

  useEffect(() => {
    if (pin.length === 4 && storedPin !== null) {
      if (pin === storedPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin("");
        }, 500);
      }
    }
  }, [pin, storedPin, onUnlock]);

  const press = (d: string) => {
    if (pin.length < 4) setPin(pin + d);
  };
  const backspace = () => setPin(pin.slice(0, -1));

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 via-violet-50 to-sky-50 px-6">
      <motion.div
        animate={error ? { x: [0, -10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center w-full max-w-xs"
      >
        <div className="size-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center shadow-xl mb-5">
          <Lock className="size-9 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Espace parents</h1>
        <p className="text-sm text-slate-500 mb-6">Entre ton code à 4 chiffres</p>

        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={pin.length > i ? { scale: [0.6, 1.1, 1] } : {}}
              className={`size-4 rounded-full ${
                pin.length > i ? "bg-indigo-500" : "bg-slate-300"
              } ${error ? "!bg-red-400" : ""}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <PinButton key={d} onClick={() => press(d)}>{d}</PinButton>
          ))}
          <div />
          <PinButton onClick={() => press("0")}>0</PinButton>
          <button
            onClick={backspace}
            className="size-16 mx-auto rounded-2xl flex items-center justify-center text-slate-500 active:bg-slate-200"
            aria-label="Effacer"
          >
            <Delete className="size-6" />
          </button>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Code par défaut : <b>0000</b>
        </p>
      </motion.div>
    </div>
  );
}

function PinButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="size-16 mx-auto rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl font-bold text-slate-700 active:shadow-sm"
    >
      {children}
    </motion.button>
  );
}
