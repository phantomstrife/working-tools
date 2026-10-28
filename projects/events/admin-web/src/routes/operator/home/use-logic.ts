import { useTranslate } from '@admin-web/locale';
import { useStoreSession } from '@admin-web/stores/session';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.operator.placeholder',
   });

   const events = useStoreSession((store) => store.events);
   const selectedEventId = useStoreSession((store) => store.selectedEventId);
   const selectedGameId = useStoreSession((store) => store.selectedGameId);

   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const selectedGame = selectedEvent?.games.find((game) => game.id === selectedGameId) ?? null;
   const gameType = selectedGame?.game_type ?? 'LUCKY_DRAW';

   return {
      param: {
         selectedEvent,
         selectedGame,
         gameType,
      },
      func: {
         translate,
      },
   };
}

