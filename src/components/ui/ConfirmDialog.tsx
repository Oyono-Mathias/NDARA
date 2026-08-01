import React, { createContext, useContext, useState, ReactNode } from 'react';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveFn, setResolveFn] = useState<((val: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions | string): Promise<boolean> => {
    if (typeof opts === 'string') {
      setOptions({ message: opts });
    } else {
      setOptions(opts);
    }
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveFn(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveFn) resolveFn(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveFn) resolveFn(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">{options.title || "Confirmation"}</h3>
            <p className="text-slate-300 text-sm mb-6">{options.message}</p>
            <div className="flex justify-end space-x-3">
              <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition">
                {options.cancelText || "Annuler"}
              </button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition">
                {options.confirmText || "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
