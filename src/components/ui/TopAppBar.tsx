import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface TopAppBarProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: ReactNode;
  transparent?: boolean;
}

export function TopAppBar({ title, onBack, showBack = true, rightAction, transparent = false }: TopAppBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`sticky top-0 z-40 w-full safe-top ${transparent ? 'bg-gradient-to-b from-black/80 to-transparent' : 'glass border-b border-white/5'} transition-all duration-300`}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left Side: Back Button or Placeholder to balance flex */}
        <div className="w-10 flex items-center justify-start">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Center: Title */}
        <h1 className="font-serif font-bold text-lg text-white absolute left-1/2 -translate-x-1/2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%] text-center tracking-wide">
          {title}
        </h1>

        {/* Right Side: Action or Placeholder */}
        <div className="w-10 flex items-center justify-end">
          {rightAction}
        </div>
      </div>
    </div>
  );
}
