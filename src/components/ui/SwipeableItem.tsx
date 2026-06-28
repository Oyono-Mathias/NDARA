import { motion, useAnimation, PanInfo } from "motion/react";
import { ReactNode, useState } from "react";

interface SwipeableItemProps {
  children: ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightAction?: ReactNode;
  leftAction?: ReactNode;
  key?: string | number;
}

export function SwipeableItem({ children, onSwipeRight, onSwipeLeft, rightAction, leftAction }: SwipeableItemProps) {
  const controls = useAnimation();
  const [exitX, setExitX] = useState<number | null>(null);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold && onSwipeRight) {
      setExitX(500);
      await controls.start({ x: 500, transition: { duration: 0.2 } });
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      setExitX(-500);
      await controls.start({ x: -500, transition: { duration: 0.2 } });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-3">
      <div className="absolute inset-0 flex items-center justify-between px-6 bg-red-500/20">
        <div className="text-emerald-500">{rightAction}</div>
        <div className="text-red-500">{leftAction}</div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: leftAction ? -150 : 0, right: rightAction ? 150 : 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 bg-black/50 backdrop-blur-md h-full border border-white/5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
      >
        {children}
      </motion.div>
    </div>
  );
}
