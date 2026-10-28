'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';

import { GuardCheckIn } from '@admin-web/features/game-lucky-draw/guard-check-in';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageGuardHome: AdminWeb.Router.Page = () => {
   const { param, func } = useLogic();
   const { empty } = useStyle;

   if (!param.selectedGameId && param.isLoading) {
      return (
         <div className={empty.wrapper}>
            <div className={empty.icon}>
               <RefreshCw
                  size={22}
                  className={empty.loading_icon}
               />
            </div>
            <p className={empty.description}>{func.translate('loading_assignments')}</p>
         </div>
      );
   }

   if (!param.selectedGameId) {
      return (
         <div className={empty.wrapper}>
            <div className={empty.icon}>
               <ShieldAlert size={24} />
            </div>
            <h2 className={empty.title}>{func.translate('empty_assignment_title')}</h2>
            <p className={empty.description}>{func.translate('empty_assignment_description')}</p>
         </div>
      );
   }

   return (
      <GuardCheckIn
         key={param.selectedGameId}
         gameId={param.selectedGameId}
      />
   );
};
