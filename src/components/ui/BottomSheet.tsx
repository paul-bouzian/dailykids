"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function BottomSheet({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const dismiss = () => setOpen(false);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={dismiss}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) dismiss();
            }}
            className="fixed bottom-0 inset-x-0 z-[101] bg-white rounded-t-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>
            {title && (
              <h2 className="text-center text-lg font-bold text-slate-800 pb-3">
                {title}
              </h2>
            )}
            <BottomSheetContext.Provider value={dismiss}>
              {children}
            </BottomSheetContext.Provider>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { createContext, useContext } from "react";
const BottomSheetContext = createContext<(() => void) | null>(null);

export function useBottomSheetDismiss() {
  return useContext(BottomSheetContext);
}
