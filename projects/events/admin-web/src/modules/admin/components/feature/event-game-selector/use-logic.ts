import type { EventRow } from '@/modules/admin/services/company/overview/get-initial-data/type';
import type { GameRow } from '@/modules/admin/services/company/overview/get-event-games/type';

export type EventGameSelectorProps = {
   events: EventRow[];
   games: GameRow[];
   selectedEventId: string;
   selectedGameId: string;
   isLoadingGames: boolean;
   onSelectEvent: (eventId: string) => void;
   onSelectGame: (gameId: string) => void;
};

export function useLogic(props: EventGameSelectorProps) {
   const {
      events,
      games,
      selectedEventId,
      selectedGameId,
      isLoadingGames,
      onSelectEvent,
      onSelectGame,
   } = props;

   const isGameSelectDisabled = !selectedEventId || isLoadingGames;

   function handleEventChange(event: React.ChangeEvent<HTMLSelectElement>) {
      onSelectEvent(event.target.value);
   }

   function handleGameChange(event: React.ChangeEvent<HTMLSelectElement>) {
      onSelectGame(event.target.value);
   }

   return {
      param: {
         events,
         games,
         selectedEventId,
         selectedGameId,
         isLoadingGames,
         isGameSelectDisabled,
      },
      func: {
         handleEventChange,
         handleGameChange,
      },
   };
}

