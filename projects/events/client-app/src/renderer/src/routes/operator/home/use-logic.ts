import { useTranslate } from '@client-app/locale';
import { useStoreSession } from '@client-app/store/session';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.operator.placeholder',
   });

   const events = useStoreSession((store) => store.events);
   const selectedEventId = useStoreSession((store) => store.selectedEventId);
   const selectedGameId = useStoreSession((store) => store.selectedGameId);

   const selectedEvent = events.find((item) => item.id === selectedEventId) ?? null;
   const selectedGame = selectedEvent?.games.find((game) => game.id === selectedGameId) ?? null;

   return {
      param: {
         selectedEvent,
         selectedGame,
      },
      func: {
         translate,
      },
   };
}

