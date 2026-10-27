'use client';

import { Calendar, ChevronsRight, Gamepad2, Pencil, Plus, Trash2 } from 'lucide-react';

import { ConfirmModal } from '@admin-web/components/confirm-modal';
import { FormField } from '@admin-web/components/form-field';
import { Modal } from '@admin-web/components/modal';
import { EventForm } from '@admin-web/features/event/event-form';
import { GameForm } from '@admin-web/features/event/game-form';

import { MODAL_ID } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const EventGameSelector: AdminWeb.Component<Types.Properties> = (properties) => {
   const { state, param, func } = useLogic(properties);
   const { root, field } = useStyle;

   const isEventActionDisabled = !param.selectedEvent;
   const isGameActionDisabled = !param.selectedGame;

   return (
      <>
         <section className={root.wrapper}>
            <div className={field.column}>
               <FormField
                  id="event-select"
                  Icon={Calendar}
                  label={func.translate('event_label')}
                  hint={func.translate('event_count', { count: param.events.length })}
               >
                  <select
                     id="event-select"
                     className={field.select}
                     value={state.eventId}
                     onChange={func.handleChangeEvent}
                  >
                     <option value="">{func.translate('event_placeholder')}</option>
                     {param.events.map((event) => (
                        <option
                           key={`event-${event.id}`}
                           value={event.id}
                        >
                           {event.name} ({event.status})
                        </option>
                     ))}
                  </select>
               </FormField>
               <div className={field.toolbar}>
                  <button
                     type="button"
                     onClick={func.handleOpenCreateEvent}
                     className={field.action_button({ variant: 'primary' })}
                  >
                     <Plus size={14} />
                     <span>{func.translate('actions.create')}</span>
                  </button>
                  <button
                     type="button"
                     disabled={isEventActionDisabled}
                     onClick={func.handleOpenEditEvent}
                     className={field.action_button({ variant: 'secondary', disabled: isEventActionDisabled })}
                  >
                     <Pencil size={13} />
                     <span>{func.translate('actions.edit')}</span>
                  </button>
                  <button
                     type="button"
                     disabled={isEventActionDisabled}
                     onClick={func.handleOpenDeleteEvent}
                     className={field.action_button({ variant: 'danger', disabled: isEventActionDisabled })}
                  >
                     <Trash2 size={13} />
                     <span>{func.translate('actions.delete')}</span>
                  </button>
               </div>
            </div>

            <ChevronsRight className={field.arrow} />

            <div className={field.column}>
               <FormField
                  id="game-select"
                  Icon={Gamepad2}
                  label={func.translate('game_label')}
                  hint={func.translate('game_count', { count: param.games.length })}
               >
                  <select
                     id="game-select"
                     className={field.select}
                     value={state.gameId}
                     onChange={func.handleChangeGame}
                  >
                     <option value="">{func.translate('game_placeholder')}</option>
                     {param.games.map((game) => (
                        <option
                           key={`event-${state.eventId}-game-${game.id}`}
                           value={game.id}
                        >
                           {game.name}
                        </option>
                     ))}
                  </select>
               </FormField>
               <div className={field.toolbar}>
                  <button
                     type="button"
                     disabled={param.isCreateGameDisabled}
                     onClick={func.handleOpenCreateGame}
                     className={field.action_button({ variant: 'primary', disabled: param.isCreateGameDisabled })}
                  >
                     <Plus size={14} />
                     <span>{func.translate('actions.create')}</span>
                  </button>
                  <button
                     type="button"
                     disabled={isGameActionDisabled}
                     onClick={func.handleOpenEditGame}
                     className={field.action_button({ variant: 'secondary', disabled: isGameActionDisabled })}
                  >
                     <Pencil size={13} />
                     <span>{func.translate('actions.edit')}</span>
                  </button>
                  <button
                     type="button"
                     disabled={isGameActionDisabled}
                     onClick={func.handleOpenDeleteGame}
                     className={field.action_button({ variant: 'danger', disabled: isGameActionDisabled })}
                  >
                     <Trash2 size={13} />
                     <span>{func.translate('actions.delete')}</span>
                  </button>
               </div>
            </div>
         </section>

         <Modal
            id={MODAL_ID.EVENT_FORM}
            title={
               param.targetEvent
                  ? func.translate('modals.edit_event_title')
                  : func.translate('modals.create_event_title')
            }
            description={
               param.targetEvent
                  ? func.translate('modals.edit_event_description')
                  : func.translate('modals.create_event_description')
            }
            style={{ width: '42rem', bodyClass: 'p-0' }}
         >
            {(close) => (
               <EventForm
                  companyId={param.companyId}
                  event={param.targetEvent}
                  onCancel={close}
                  onSuccess={(savedEvent) => {
                     close();
                     func.handleEventSaved(savedEvent);
                  }}
               />
            )}
         </Modal>

         <Modal
            id={MODAL_ID.GAME_FORM}
            title={
               param.targetGame ? func.translate('modals.edit_game_title') : func.translate('modals.create_game_title')
            }
            description={
               param.targetGame
                  ? func.translate('modals.edit_game_description')
                  : func.translate('modals.create_game_description')
            }
            style={{ width: '36rem', bodyClass: 'p-0' }}
         >
            {(close) => (
               <GameForm
                  events={param.events}
                  defaultEventId={state.eventId}
                  game={param.targetGame}
                  onCancel={close}
                  onSuccess={(savedGame) => {
                     close();
                     func.handleGameSaved(savedGame);
                  }}
               />
            )}
         </Modal>

         <ConfirmModal
            id={MODAL_ID.DELETE_EVENT}
            isLoading={param.isDeletingEvent}
            title={func.translate('modals.delete_event_title')}
            description={func.translate('modals.delete_event_description')}
            message={func.translate('modals.delete_event_message', {
               name: (param.targetEvent ?? param.selectedEvent)?.name ?? '',
            })}
            cancelLabel={func.translate('actions.cancel')}
            confirmLabel={func.translate('actions.delete_event_confirm')}
            loadingLabel={func.translate('actions.deleting')}
            onConfirm={func.handleConfirmDeleteEvent}
         />

         <ConfirmModal
            id={MODAL_ID.DELETE_GAME}
            isLoading={param.isDeletingGame}
            title={func.translate('modals.delete_game_title')}
            description={func.translate('modals.delete_game_description')}
            message={func.translate('modals.delete_game_message', {
               name: (param.targetGame ?? param.selectedGame)?.name ?? '',
            })}
            cancelLabel={func.translate('actions.cancel')}
            confirmLabel={func.translate('actions.delete_game_confirm')}
            loadingLabel={func.translate('actions.deleting')}
            onConfirm={func.handleConfirmDeleteGame}
         />
      </>
   );
};
