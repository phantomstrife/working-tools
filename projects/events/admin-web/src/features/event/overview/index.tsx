'use client';

import { EventGameSelector } from '@admin-web/features/event/game-selector';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';
import { Gamepad2 } from 'lucide-react';

export const EventGameOverview: AdminWeb.Component<Types.Properties> = (properties) => {
   const { events } = properties;

   const { state, func } = useLogic();
   const { root, notify } = useStyle;

   return (
      <div className={root.wrapper}>
         <EventGameSelector
            events={events}
            onChooseGame={(game) => func.setState({ game })}
         />

         {!state.game && (
            <div className={notify.wrapper}>
               <div className={notify.icon}>
                  <Gamepad2 size={24} />
               </div>
               <h2 className={notify.title}>{func.translate('title')}</h2>
               <span className={notify.description}>{func.translate('description')}</span>
            </div>
         )}
      </div>
   );
};
