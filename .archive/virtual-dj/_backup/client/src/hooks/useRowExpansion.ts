import { useCallback, useState } from 'react';

interface Expansion {
   /** The song this state belongs to. When the current song changes, the state starts over. */
   trackIndex: number;
   open: ReadonlySet<number>;
   userToggled: boolean;
}

const NONE: ReadonlySet<number> = new Set();
const fresh = (trackIndex: number): Expansion => ({ trackIndex, open: NONE, userToggled: false });

/**
 * Which song rows are expanded. Until the user clicks something, the current song is open; when the
 * current song changes, the choices reset so the new current song opens automatically.
 */
export function useRowExpansion(trackIndex: number) {
   const [stored, setStored] = useState<Expansion>(() => fresh(trackIndex));
   const current = stored.trackIndex === trackIndex ? stored : fresh(trackIndex);

   const isOpen = (index: number): boolean => current.open.has(index) || (!current.userToggled && index === trackIndex);

   const toggle = useCallback(
      (index: number): void => {
         setStored((prev) => {
            const base = prev.trackIndex === trackIndex ? prev : fresh(trackIndex);
            const wasOpen = base.open.has(index) || (!base.userToggled && index === trackIndex);
            const open = new Set(base.open);
            if (wasOpen) open.delete(index);
            else open.add(index);
            return { trackIndex, open, userToggled: true };
         });
      },
      [trackIndex],
   );

   return { isOpen, toggle };
}
