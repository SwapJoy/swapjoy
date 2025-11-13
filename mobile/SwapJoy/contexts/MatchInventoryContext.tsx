import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ItemMini, Bundle } from '@utils/matchSuggestions';

interface MatchInventoryContextValue {
  items: ItemMini[];
  bundles: Bundle[];
  setItems: (items: ItemMini[]) => void;
  setBundles: (bundles: Bundle[]) => void;
  reset: () => void;
}

const MatchInventoryContext = createContext<MatchInventoryContextValue | undefined>(undefined);

export const MatchInventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ItemMini[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);

  const value = useMemo<MatchInventoryContextValue>(
    () => ({
      items,
      bundles,
      setItems,
      setBundles,
      reset: () => {
        setItems([]);
        setBundles([]);
      },
    }),
    [items, bundles]
  );

  return <MatchInventoryContext.Provider value={value}>{children}</MatchInventoryContext.Provider>;
};

export function useMatchInventoryContext(): MatchInventoryContextValue {
  const ctx = useContext(MatchInventoryContext);
  if (!ctx) {
    throw new Error('useMatchInventoryContext must be used within a MatchInventoryProvider');
  }
  return ctx;
}
