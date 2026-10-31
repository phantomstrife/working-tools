import { createContext, useContext } from 'react';
import type { ShowState } from './showReducer';

export const ShowStateContext = createContext<ShowState | null>(null);

/** Song position in seconds, updated once per display frame. Only live widgets should read it. */
export const ElapsedContext = createContext<number>(0);

export function useShowState(): ShowState {
   const state = useContext(ShowStateContext);
   if (!state) throw new Error('useShowState must be used inside <ShowProvider>');
   return state;
}

export function useElapsed(): number {
   return useContext(ElapsedContext);
}
