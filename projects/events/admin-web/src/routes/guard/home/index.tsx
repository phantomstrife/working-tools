'use client';

import { Calendar, Gamepad2, RefreshCw, ShieldAlert } from 'lucide-react';

import { GuardCheckIn } from '@admin-web/features/game-lucky-draw/guard-check-in';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageGuardHome: AdminWeb.Router.Page = () => {
   const { param, func } = useLogic();
   const { root, selector, empty } = useStyle;

   return (
      <div className={root.wrapper}>
         <div className={selector.wrapper}>
            <div className={selector.fields}>
               <div className={selector.field}>
                  <Calendar className={selector.icon} />
                  <span className={selector.label}>{func.translateVenue('event_label')}:</span>
                  <select
                     value={param.selectedEventId}
                     disabled={param.isLoading || param.events.length === 0}
                     onChange={func.handleEventChange}
                     className={selector.select}
                  >
                     {param.events.length === 0 ? (
                        <option value="">{func.translateVenue('no_events')}</option>
                     ) : (
                        param.events.map((event) => (
                           <option
                              key={event.id}
                              value={event.id}
                           >
                              {event.name}
                           </option>
                        ))
                     )}
                  </select>
               </div>

               <div className={selector.field}>
                  <Gamepad2 className={selector.icon} />
                  <span className={selector.label}>{func.translateVenue('game_label')}:</span>
                  <select
                     value={param.selectedGameId}
                     disabled={param.isLoading || param.games.length === 0}
                     onChange={func.handleGameChange}
                     className={selector.select}
                  >
                     {param.games.length === 0 ? (
                        <option value="">{func.translateVenue('no_games')}</option>
                     ) : (
                        param.games.map((game) => (
                           <option
                              key={game.id}
                              value={game.id}
                           >
                              {game.name}
                           </option>
                        ))
                     )}
                  </select>
               </div>
            </div>

            <div className={selector.actions}>
               {param.selectedGame && (
                  <span className={selector.status({ status: param.selectedGame.status })}>
                     {func.translateVenue(`game_status.${param.selectedGame.status}`)}
                  </span>
               )}
               <button
                  type="button"
                  title={func.translateVenue('refresh_assignments')}
                  disabled={param.isLoading}
                  onClick={func.fetchAssignments}
                  className={selector.refresh_button}
               >
                  <RefreshCw className={selector.refresh_icon({ loading: param.isLoading })} />
                  <span>{func.translateVenue('refresh_assignments')}</span>
               </button>
            </div>
         </div>

         {!param.selectedGameId && param.isLoading ? (
            <div className={empty.wrapper}>
               <div className={empty.icon}>
                  <RefreshCw
                     size={22}
                     className={empty.loading_icon}
                  />
               </div>
               <p className={empty.description}>{func.translate('loading_assignments')}</p>
            </div>
         ) : !param.selectedGameId ? (
            <div className={empty.wrapper}>
               <div className={empty.icon}>
                  <ShieldAlert size={24} />
               </div>
               <h2 className={empty.title}>{func.translate('empty_assignment_title')}</h2>
               <p className={empty.description}>{func.translate('empty_assignment_description')}</p>
            </div>
         ) : (
            <GuardCheckIn
               key={param.selectedGameId}
               gameId={param.selectedGameId}
            />
         )}
      </div>
   );
};
