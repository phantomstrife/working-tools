'use client';

import { useRef } from 'react';
import { Gift, RefreshCw, User2Icon } from 'lucide-react';

import { StatusBadge } from '@admin-web/components/status-badge';
import { AttendantsDatatable } from '@admin-web/features/game-lucky-draw/attendants-datatable';
import { PrizePanel } from '@admin-web/features/game-lucky-draw/prize-panel';
import { StaffPanel } from '@admin-web/features/game-lucky-draw/staff-panel';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const GameLuckyDrawOverview: AdminWeb.Component<Types.Properties> = (properties) => {
   const attendantsRef = useRef<Types.AttendantsDatatableHandle>(null);
   const prizesRef = useRef<Types.PrizePanelHandle>(null);
   const staffRef = useRef<Types.StaffPanelHandle>(null);

   const { state, param, func } = useLogic(properties, {
      attendants: attendantsRef,
      prizes: prizesRef,
      staff: staffRef,
   });
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
            ref={attendantsRef}
            key={`attendants-${param.game.id}`}
            gameId={param.game.id}
            isLoading={state.loading}
         />

         <div className={root.panels_grid}>
            <PrizePanel
               ref={prizesRef}
               key={`prizes-${param.game.id}`}
               className={root.prize_col}
               gameId={param.game.id}
               isLoading={state.loading}
               onDataChange={func.fetchPrizes}
            />
            <StaffPanel
               ref={staffRef}
               key={`staff-${param.game.id}`}
               className={root.staff_col}
               gameId={param.game.id}
               isLoading={state.loading}
               onDataChange={func.fetchStaffs}
            />
         </div>
      </div>
   );
};
