import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { HAKAS } from '../data/hakas';

interface BadgeContextValue {
  /** IDs of hakas whose badge is currently unlocked */
  unlockedIds: Set<string>;
  /** Call this after a successful claim so the FAB updates immediately */
  unlockBadge: (hakaId: string) => void;
}

const BadgeContext = createContext<BadgeContextValue>({
  unlockedIds: new Set(),
  unlockBadge: () => {},
});

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const initial = new Set<string>();
    HAKAS.forEach((h) => {
      if (window.localStorage.getItem(h.storageKey) === 'true') {
        initial.add(h.id);
      }
    });
    return initial;
  });

  // Re-sync whenever localStorage is written from another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      const haka = HAKAS.find((h) => h.storageKey === e.key);
      if (!haka) return;
      if (e.newValue === 'true') {
        setUnlockedIds((prev) => new Set([...prev, haka.id]));
      } else {
        setUnlockedIds((prev) => {
          const next = new Set(prev);
          next.delete(haka.id);
          return next;
        });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const unlockBadge = useCallback((hakaId: string) => {
    setUnlockedIds((prev) => new Set([...prev, hakaId]));
  }, []);

  return (
    <BadgeContext.Provider value={{ unlockedIds, unlockBadge }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => useContext(BadgeContext);
