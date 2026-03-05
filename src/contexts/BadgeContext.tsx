import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BARRACA_PROMOS } from '../data/barracaPromos';
import { CCC_PASS_ID, CCC_PASS_STORAGE_KEY } from '../data/cccPass';

interface BadgeContextValue {
  /** IDs of barracas whose badge is currently unlocked, plus CCC_PASS_ID if active */
  unlockedIds: Set<string>;
  /** Call this after a successful claim so the FAB updates immediately */
  unlockBadge: (barracaPromoId: string) => void;
}

const BadgeContext = createContext<BadgeContextValue>({
  unlockedIds: new Set(),
  unlockBadge: () => {},
});

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const initial = new Set<string>();
    BARRACA_PROMOS.forEach((b) => {
      if (window.localStorage.getItem(b.storageKey) === 'true') {
        initial.add(b.id);
      }
    });
    // Check CCC All-Access Pass
    if (window.localStorage.getItem(CCC_PASS_STORAGE_KEY) === 'true') {
      initial.add(CCC_PASS_ID);
    }
    return initial;
  });

  // Re-sync whenever localStorage is written from another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // Handle CCC All-Access Pass key
      if (e.key === CCC_PASS_STORAGE_KEY) {
        if (e.newValue === 'true') {
          setUnlockedIds((prev) => new Set([...prev, CCC_PASS_ID]));
        } else {
          setUnlockedIds((prev) => {
            const next = new Set(prev);
            next.delete(CCC_PASS_ID);
            return next;
          });
        }
        return;
      }
      const barraca = BARRACA_PROMOS.find((b) => b.storageKey === e.key);
      if (!barraca) return;
      if (e.newValue === 'true') {
        setUnlockedIds((prev) => new Set([...prev, barraca.id]));
      } else {
        setUnlockedIds((prev) => {
          const next = new Set(prev);
          next.delete(barraca.id);
          return next;
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const unlockBadge = useCallback((barracaPromoId: string) => {
    setUnlockedIds((prev) => new Set([...prev, barracaPromoId]));
  }, []);

  return (
    <BadgeContext.Provider value={{ unlockedIds, unlockBadge }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => useContext(BadgeContext);
