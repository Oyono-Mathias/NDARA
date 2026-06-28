import { ReactNode } from "react";
import { TouchArea } from "./TouchArea";

interface FABProps {
  icon: ReactNode;
  onClick: () => void;
  className?: string;
  position?: "bottom-right" | "bottom-center" | "bottom-left";
}

export function FAB({ icon, onClick, className = "", position = "bottom-right" }: FABProps) {
  const positionClasses = {
    "bottom-right": "bottom-24 right-6",
    "bottom-center": "bottom-24 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-24 left-6"
  };

  return (
    <TouchArea
      as="button"
      onClick={onClick}
      className={`fixed ${positionClasses[position]} w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-[0_8px_30px_rgba(16,185,129,0.5)] z-[60] ${className}`}
    >
      {icon}
    </TouchArea>
  );
}
