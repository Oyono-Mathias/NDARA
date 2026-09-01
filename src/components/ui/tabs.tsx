import React, { createContext, useContext } from 'react';
import { classNames } from '../../lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const Tabs: React.FC<{ value: string; onValueChange: (value: string) => void; children: React.ReactNode; className?: string }> = ({ value, onValueChange, children, className }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div className={classNames("flex flex-col", className)}>{children}</div>
  </TabsContext.Provider>
);

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    role="tablist"
    className={classNames("flex items-center justify-center p-1 bg-gray-100 rounded-xl overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]", className)}
    {...props}
  />
);

export const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }> = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  const isSelected = context.value === value;
  return (
    <button
      role="tab"
      aria-selected={isSelected}
      type="button"
      onClick={() => context.onValueChange(value)}
      className={classNames(
        "min-h-[44px] flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
        isSelected ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  if (context.value !== value) return null;
  return (
    <div role="tabpanel" className={classNames("mt-4 focus:outline-none", className)} {...props}>
      {children}
    </div>
  );
};
