import { create } from 'zustand';

import { LAST_GAME_STORAGE_KEY } from './constants';

import type * as Types from './type';

const readPersistedSelection = (accountId: string): Types.Persisted_Selection | null => {
   try {
      const raw = window.localStorage.getItem(`${LAST_GAME_STORAGE_KEY}:${accountId}`);
      if (!raw) {
         return null;
      }

      return JSON.parse(raw) as Types.Persisted_Selection;
   } catch {
      return null;
   }
};

const writePersistedSelection = (accountId: string, eventId: string, gameId: string) => {
   try {
      window.localStorage.setItem(`${LAST_GAME_STORAGE_KEY}:${accountId}`, JSON.stringify({ eventId, gameId }));
   } catch {
      //
   }
};

export const useStoreSession = create<Types.Store>((set, get) => ({
   status: 'LOADING',
   account: null,
   events: [],
   selectedEventId: '',
   selectedGameId: '',
   isLoadingAssignments: false,

   setAuthenticated: (account) => {
      set({
         status: 'AUTHENTICATED',
         account,
      });
   },

   setUnauthenticated: () => {
      set({
         status: 'UNAUTHENTICATED',
         account: null,
         events: [],
         selectedEventId: '',
         selectedGameId: '',
         isLoadingAssignments: false,
      });
   },

   setLoadingAssignments: (isLoadingAssignments) => {
      set({ isLoadingAssignments });
   },

   setAssignments: (events) => {
      const { account, selectedEventId, selectedGameId } = get();
      const persisted = account ? readPersistedSelection(account.id) : null;

      const preferredEventId = selectedEventId || persisted?.eventId || '';
      const matchedEvent = events.find((item) => item.id === preferredEventId) ?? events[0] ?? null;

      if (!matchedEvent) {
         set({
            events,
            selectedEventId: '',
            selectedGameId: '',
            isLoadingAssignments: false,
         });
         return;
      }

      const preferredGameId = selectedGameId || persisted?.gameId || '';
      const matchedGame =
         matchedEvent.games.find((game) => game.id === preferredGameId) ?? matchedEvent.games[0] ?? null;

      const nextEventId = matchedEvent.id;
      const nextGameId = matchedGame?.id ?? '';

      if (account && nextEventId && nextGameId) {
         writePersistedSelection(account.id, nextEventId, nextGameId);
      }

      set({
         events,
         selectedEventId: nextEventId,
         selectedGameId: nextGameId,
         isLoadingAssignments: false,
      });
   },

   selectEvent: (eventId) => {
      const { account, events } = get();
      const targetEvent = events.find((item) => item.id === eventId);
      const nextGameId = targetEvent?.games[0]?.id ?? '';

      if (account && eventId && nextGameId) {
         writePersistedSelection(account.id, eventId, nextGameId);
      }

      set({
         selectedEventId: eventId,
         selectedGameId: nextGameId,
      });
   },

   selectGame: (gameId) => {
      const { account, selectedEventId } = get();

      if (account && selectedEventId && gameId) {
         writePersistedSelection(account.id, selectedEventId, gameId);
      }

      set({
         selectedGameId: gameId,
      });
   },
}));
