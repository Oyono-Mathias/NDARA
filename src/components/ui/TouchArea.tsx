import { useState, MouseEvent, ReactNode, ButtonHTMLAttributes, HTMLAttributes } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

type TouchAreaProps = {
  children: ReactNode;
  className?: string;
  onClick?: (e: any) => void;
  as?: 'div' | 'button' | any;
  to?: string;
  disabled?: boolean;
} & HTMLAttributes<HTMLDivElement> & ButtonHTMLAttributes<HTMLButtonElement>;

export function TouchArea({ children, className = "", onClick, as = 'div', to, ...props }: TouchAreaProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: MouseEvent<any>) => {
    if (props.disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples(prev => [...prev, { x, y, id: Date.now() }]);
    if (onClick) onClick(e);
  };

  const Component = as as any;

  return (
    <Component 
      className={`relative overflow-hidden cursor-pointer ${className} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
      onClick={handleClick}
      to={to}
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onAnimationComplete={() => setRipples(prev => prev.filter(ripple => ripple.id !== r.id))}
            className="absolute bg-white/20 rounded-full pointer-events-none"
            style={{
              left: r.x,
              top: r.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
            }}
          />
        ))}
      </AnimatePresence>
    </Component>
  );
}
