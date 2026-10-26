import { useTranslate } from '@admin-web/locale';

import type * as Types from './type';
import { useDeepState } from '@admin-web/hooks/deep-state';

export function useLogic(properties: Types.Properties) {
   const { events, onChooseGame } = properties;

   const { translate } = useTranslate({
      prefix: 'features.event.game_selector',
   });

   const [state, setState] = useDeepState<Types.State>({
      eventId: '',
      gameId: '',
   });

   const games = events.find((event) => event.id === state.eventId)?.games || [];

   const handleChangeEvent: Types.Handle_Select_Change = (event) => {
      setState(event.target.value, 'eventId');
   };

   const handleChangeGame: Types.Handle_Select_Change = (event) => {
      const gameId = event.target.value;
      const game = games.find((game) => game.id === gameId);

      if (!game) {
         return;
      }

      setState(gameId, 'gameId');
      onChooseGame?.(game);
   };

   return {
      state,
      param: {
         events,
         games,
      },
      func: {
         translate,
         handleChangeEvent,
         handleChangeGame,
      },
   };
}
