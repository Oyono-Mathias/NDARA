import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useEffect, ReactNode } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[#111] rounded-t-3xl border-t border-white/10 pb-safe max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-center p-3 shrink-0">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
            
            {title && (
              <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5 shrink-0">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className="overflow-y-auto px-6 py-6 hide-scrollbar flex-1 relative">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
