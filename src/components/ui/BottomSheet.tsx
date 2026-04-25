"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

const BottomSheetContext = createContext<(() => void) | null>(null);

export function useBottomSheetDismiss() {
  return useContext(BottomSheetContext);
}

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
  const [mounted, setMounted] = useState(false);
  const dismiss = () => setOpen(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const content = (
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
            className="fixed bottom-0 inset-x-0 z-[101] bg-white rounded-t-[2rem] shadow-2xl max-h-[92dvh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="shrink-0 pt-2 pb-1 flex flex-col items-center select-none">
              <SwipeHandle onDismiss={dismiss} />
              {title && (
                <h2 className="text-center text-lg font-bold text-slate-800 pb-2 pt-1 px-10">
                  {title}
                </h2>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <BottomSheetContext.Provider value={dismiss}>
                {children}
              </BottomSheetContext.Provider>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

function SwipeHandle({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 80 || info.velocity.y > 600) onDismiss();
      }}
      className="px-12 py-2 -my-2 touch-none cursor-grab active:cursor-grabbing"
    >
      <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto" />
    </motion.div>
  );
}
