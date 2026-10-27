'use client';

import { useRef } from 'react';
import { Gift, RefreshCw, User2Icon } from 'lucide-react';

import { StatusBadge } from '@admin-web/components/status-badge';
import { AttendantsDatatable } from '@admin-web/features/game-lucky-draw/attendants-datatable';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const GameLuckyDrawOverview: AdminWeb.Component<Types.Properties> = (properties) => {
   const datatableRef = useRef<Types.AttendantsDatatableHandle>(null);

   const { state, param, func } = useLogic(properties, datatableRef);
   const { root, statistic } = useStyle;

   return (
      <div className={root.wrapper}>
         <div className={statistic.wrapper}>
            <h2 className={statistic.name}>{param.game.name}</h2>
            {param.game.status === 'LIVE' && (
               <StatusBadge
                  className={statistic.status}
                  status="ACTIVE"
               >
                  {param.game.status}
               </StatusBadge>
            )}
            <div className={statistic.prize}>
               <Gift
                  className={statistic.icon()}
                  size={16}
               />
               {func.translate('prize')}: <strong>{state.prizeCount}</strong>
            </div>
            <div className={statistic.staff}>
               <User2Icon
                  className={statistic.icon()}
                  size={16}
               />
               {func.translate('staff')}: <strong>{state.staffCount}</strong>
            </div>
            <button
               type="button"
               className={statistic.tool}
               onClick={func.synchronizeData}
            >
               <RefreshCw
                  className={statistic.icon({ loading: state.loading })}
                  size={16}
               />
            </button>
         </div>

         <AttendantsDatatable
            ref={datatableRef}
            key={param.game.id}
            gameId={param.game.id}
            isLoading={state.loading}
         />
      </div>
   );
};
