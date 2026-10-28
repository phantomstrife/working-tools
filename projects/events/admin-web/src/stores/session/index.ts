import { create } from 'zustand';

import { LAST_GAME_STORAGE_KEY } from './constants';

import type * as Types from './type';

const getStorageKey = (account: Types.Account): string => {
   return `${LAST_GAME_STORAGE_KEY}:${account.id}:${account.company_id ?? 'all'}`;
};

const readPersistedSelection = (account: Types.Account): Types.Persisted_Selection | null => {
   try {
      const raw = window.localStorage.getItem(getStorageKey(account));
      if (!raw) {
         return null;
      }

      return JSON.parse(raw) as Types.Persisted_Selection;
   } catch {
      return null;
   }
};

const writePersistedSelection = (account: Types.Account, eventId: string, gameId: string) => {
   try {
      window.localStorage.setItem(getStorageKey(account), JSON.stringify({ eventId, gameId }));
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
      const currentAccount = get().account;
      const isSameAccount = currentAccount?.id === account.id;

      set({
         status: 'AUTHENTICATED',
         account,
         ...(isSameAccount
            ? {}
            : {
                 events: [],
                 selectedEventId: '',
                 selectedGameId: '',
                 isLoadingAssignments: true,
              }),
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
      const persisted = account ? readPersistedSelection(account) : null;

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
         writePersistedSelection(account, nextEventId, nextGameId);
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
         writePersistedSelection(account, eventId, nextGameId);
      }

      set({
         selectedEventId: eventId,
         selectedGameId: nextGameId,
      });
   },

   selectGame: (gameId) => {
      const { account, selectedEventId } = get();

      if (account && selectedEventId && gameId) {
         writePersistedSelection(account, selectedEventId, gameId);
      }

      set({
         selectedGameId: gameId,
      });
   },
}));

