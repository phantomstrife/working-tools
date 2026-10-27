import { useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { useStoreModal } from '@admin-web/components/modal';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useServicesEventDelete } from '@admin-web/services/event/delete';
import { useServicesGameDelete } from '@admin-web/services/game/delete';

import { MODAL_ID } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { events, onChooseGame } = properties;

   const params = useParams<{ companyId?: string }>();
   const modalActions = useStoreModal((store) => store.actions);

   const { translate } = useTranslate({
      prefix: 'features.event.game_selector',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      events,
      eventId: '',
      gameId: '',
      targetEvent: null,
      targetGame: null,
      isDeletingEvent: false,
      isDeletingGame: false,
   });

   useEffect(() => {
      setState({ events });
   }, [events, setState]);

   const resolveErrorMessage = useCallback(
      (message: string) => {
         return message.startsWith('services.') ? translateRoot(message) : message;
      },
      [translateRoot],
   );

   const selectedEvent = state.events.find((event) => event.id === state.eventId) ?? null;
   const games = selectedEvent?.games || [];
   const selectedGame = games.find((game) => game.id === state.gameId) ?? null;

   const handleChangeEvent: Types.Handle_Select_Change = (event) => {
      setState({
         eventId: event.target.value,
         gameId: '',
      });
      onChooseGame?.(null);
   };

   const handleChangeGame: Types.Handle_Select_Change = (event) => {
      const gameId = event.target.value;
      const game = games.find((item) => item.id === gameId);

      if (!game) {
         setState('', 'gameId');
         onChooseGame?.(null);
         return;
      }

      setState(gameId, 'gameId');
      onChooseGame?.(game);
   };

   const handleOpenCreateEvent = () => {
      setState({ targetEvent: null });
      modalActions.openModal(MODAL_ID.EVENT_FORM);
   };

   const handleOpenEditEvent = () => {
      if (!selectedEvent) {
         return;
      }

      setState({ targetEvent: selectedEvent });
      modalActions.openModal(MODAL_ID.EVENT_FORM);
   };

   const handleOpenDeleteEvent = () => {
      if (!selectedEvent) {
         return;
      }

      setState({ targetEvent: selectedEvent });
      modalActions.openModal(MODAL_ID.DELETE_EVENT);
   };

   const handleOpenCreateGame = () => {
      setState({ targetGame: null });
      modalActions.openModal(MODAL_ID.GAME_FORM);
   };

   const handleOpenEditGame = () => {
      if (!selectedGame) {
         return;
      }

      setState({ targetGame: selectedGame });
      modalActions.openModal(MODAL_ID.GAME_FORM);
   };

   const handleOpenDeleteGame = () => {
      if (!selectedGame) {
         return;
      }

      setState({ targetGame: selectedGame });
      modalActions.openModal(MODAL_ID.DELETE_GAME);
   };

   const handleEventSaved = (savedEvent: Types.Event) => {
      const exists = state.events.some((item) => item.id === savedEvent.id);

      if (exists) {
         const updatedEvents = state.events.map((item) =>
            item.id === savedEvent.id
               ? {
                    ...savedEvent,
                    games: savedEvent.games ?? item.games ?? [],
                 }
               : item,
         );

         setState({
            events: updatedEvents,
            targetEvent: null,
         });
         return;
      }

      setState({
         events: [...state.events, savedEvent],
         eventId: savedEvent.id,
         gameId: '',
         targetEvent: null,
      });
      onChooseGame?.(null);
   };

   const handleConfirmDeleteEvent = async () => {
      const eventToDelete = state.targetEvent ?? selectedEvent;

      if (!eventToDelete || state.isDeletingEvent) {
         return;
      }

      setState({ isDeletingEvent: true });

      const deleteResult = await useServicesEventDelete({
         id: eventToDelete.id,
      });

      if (deleteResult.error) {
         toast.error(resolveErrorMessage(deleteResult.message));
         setState({ isDeletingEvent: false });
         return;
      }

      modalActions.closeModal(MODAL_ID.DELETE_EVENT);
      toast.success(translate('toast.delete_event_success'));

      const remainingEvents = state.events.filter((item) => item.id !== eventToDelete.id);

      setState({
         events: remainingEvents,
         eventId: state.eventId === eventToDelete.id ? '' : state.eventId,
         gameId: state.eventId === eventToDelete.id ? '' : state.gameId,
         targetEvent: null,
         isDeletingEvent: false,
      });

      if (state.eventId === eventToDelete.id) {
         onChooseGame?.(null);
      }
   };

   const handleGameSaved = (savedGame: Types.Game) => {
      const updatedEvents = state.events.map((event) => {
         const filteredGames = (event.games || []).filter((item) => item.id !== savedGame.id);

         if (event.id === savedGame.event_id) {
            return {
               ...event,
               games: [...filteredGames, savedGame],
            };
         }

         return {
            ...event,
            games: filteredGames,
         };
      });

      setState({
         events: updatedEvents,
         eventId: savedGame.event_id,
         gameId: savedGame.id,
         targetGame: null,
      });

      onChooseGame?.(savedGame);
   };

   const handleConfirmDeleteGame = async () => {
      const gameToDelete = state.targetGame ?? selectedGame;

      if (!gameToDelete || state.isDeletingGame) {
         return;
      }

      setState({ isDeletingGame: true });

      const deleteResult = await useServicesGameDelete({
         id: gameToDelete.id,
      });

      if (deleteResult.error) {
         toast.error(resolveErrorMessage(deleteResult.message));
         setState({ isDeletingGame: false });
         return;
      }

      modalActions.closeModal(MODAL_ID.DELETE_GAME);
      toast.success(translate('toast.delete_game_success'));

      const updatedEvents = state.events.map((event) => ({
         ...event,
         games: (event.games || []).filter((item) => item.id !== gameToDelete.id),
      }));

      setState({
         events: updatedEvents,
         gameId: state.gameId === gameToDelete.id ? '' : state.gameId,
         targetGame: null,
         isDeletingGame: false,
      });

      if (state.gameId === gameToDelete.id) {
         onChooseGame?.(null);
      }
   };

   return {
      state,
      param: {
         companyId: typeof params?.companyId === 'string' ? params.companyId : undefined,
         events: state.events,
         games,
         selectedEvent,
         selectedGame,
         targetEvent: state.targetEvent,
         targetGame: state.targetGame,
         isDeletingEvent: state.isDeletingEvent,
         isDeletingGame: state.isDeletingGame,
         isCreateGameDisabled: state.events.length === 0,
      },
      func: {
         translate,
         handleChangeEvent,
         handleChangeGame,
         handleOpenCreateEvent,
         handleOpenEditEvent,
         handleOpenDeleteEvent,
         handleOpenCreateGame,
         handleOpenEditGame,
         handleOpenDeleteGame,
         handleEventSaved,
         handleConfirmDeleteEvent,
         handleGameSaved,
         handleConfirmDeleteGame,
      },
   };
}
