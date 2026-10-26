'use client';

import { Calendar, ChevronsRight, Gamepad2 } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const EventGameSelector: AdminWeb.Component<Types.Properties> = (properties) => {
   const { state, param, func } = useLogic(properties);
   const { root, field } = useStyle;

   return (
      <section className={root.wrapper}>
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
         <ChevronsRight className={field.arrow} />
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
      </section>
   );
};
