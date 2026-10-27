import { ShieldAlert } from 'lucide-react';

import { GuardCheckIn } from '@client-app/features/game-lucky-draw/guard-check-in';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageGuardHome: ClientApp.Router.Page = () => {
   const { param, func } = useLogic();
   const { empty } = useStyle;

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
