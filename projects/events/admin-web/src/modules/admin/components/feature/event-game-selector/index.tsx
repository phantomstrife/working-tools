'use client';

import { Calendar, Gamepad2 } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { EventGameSelectorProps } from './use-logic';

export const EventGameSelector = (props: EventGameSelectorProps) => {
   const { param, func } = useLogic(props);
   const { wrapper, fieldGroup, labelRow, label, countBadge, select, helperText, iconSm } = useStyle;

   return (
      <section className={wrapper()}>
         <div className={fieldGroup()}>
            <div className={labelRow()}>
               <label
                  htmlFor="overview-event-select"
                  className={label()}
               >
                  <Calendar className={iconSm()} />
                  <span>Select Event</span>
               </label>
               <span className={countBadge()}>{param.events.length} events</span>
            </div>

            <select
               id="overview-event-select"
               value={param.selectedEventId}
               onChange={func.handleEventChange}
               className={select({ disabled: param.events.length === 0 })}
               disabled={param.events.length === 0}
            >
               <option value="">
                  {param.events.length === 0 ? 'No events available for this company' : 'Choose an event...'}
               </option>
               {param.events.map((eventItem) => (
                  <option
                     key={eventItem.id}
                     value={eventItem.id}
                  >
                     {eventItem.name} ({eventItem.status ?? 'DRAFT'})
                  </option>
               ))}
            </select>

            <span className={helperText()}>
               Select an active or upcoming company event to load its interactive games.
            </span>
         </div>

         <div className={fieldGroup()}>
            <div className={labelRow()}>
               <label
                  htmlFor="overview-game-select"
                  className={label()}
               >
                  <Gamepad2 className={iconSm()} />
                  <span>Select Game</span>
               </label>
               <span className={countBadge()}>
                  {param.selectedEventId ? `${param.games.length} games` : 'Select event first'}
               </span>
            </div>

            <select
               id="overview-game-select"
               value={param.selectedGameId}
               onChange={func.handleGameChange}
               disabled={param.isGameSelectDisabled}
               className={select({ disabled: param.isGameSelectDisabled })}
            >
               <option value="">
                  {!param.selectedEventId
                     ? 'Select an event on the left first...'
                     : param.isLoadingGames
                       ? 'Loading games...'
                       : param.games.length === 0
                         ? 'No games configured for this event'
                         : 'Choose a game...'}
               </option>
               {param.games.map((gameItem) => (
                  <option
                     key={gameItem.id}
                     value={gameItem.id}
                  >
                     {gameItem.name} — [{gameItem.game_type}] ({gameItem.status ?? 'PENDING'})
                  </option>
               ))}
            </select>

            <span className={helperText()}>
               Only production-ready games assigned to the selected event are listed.
            </span>
         </div>
      </section>
   );
};

