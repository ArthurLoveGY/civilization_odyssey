import React, { memo, useState, createContext, useContext } from 'react';
import { cn } from '../../utils/cn';

// Create Context
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = memo(({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue: TabsContextValue = {
    value: currentValue,
    onValueChange: handleValueChange,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  isMobile?: boolean;
}

export const TabsList = memo(({ children, className, isMobile = false }: TabsListProps) => {
  return (
    <div
      className={cn(
        'grid gap-1',
        isMobile
          ? 'grid-cols-4 fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-2 z-50'
          : 'grid-cols-4 bg-neutral-900/50 border border-neutral-800 rounded-lg p-1 mb-4',
        className
      )}
    >
      {children}
    </div>
  );
});

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  isMobile?: boolean;
}

export const TabsTrigger = memo(({ value, children, className, icon, isMobile = false }: TabsTriggerProps) => {
  const context = useTabsContext();
  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(
        'flex items-center justify-center gap-2 transition-all duration-200',
        'font-medium text-sm',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isMobile
          ? 'flex-col py-2 px-1 rounded-lg'
          : 'py-2 px-4 rounded-md',
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:text-white hover:bg-neutral-800',
        className
      )}
    >
      {icon && <span className={isMobile ? 'text-xl' : 'text-lg'}>{icon}</span>}
      <span className={isMobile ? 'text-xs' : 'text-sm'}>{children}</span>
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent = memo(({ value, children, className }: TabsContentProps) => {
  const context = useTabsContext();

  if (context.value !== value) {
    return null;
  }

  return (
    <div className={cn('animate-in fade-in-0 zoom-in-95 duration-200', className)}>
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';
