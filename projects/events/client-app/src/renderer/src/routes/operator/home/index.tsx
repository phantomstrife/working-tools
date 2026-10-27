import { GameLuckyDrawInterface } from '@client-app/features/game-lucky-draw/game-interface';
import { GameSettings } from '@client-app/features/game-lucky-draw/game-settings';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageOperatorHome: ClientApp.Router.Page = () => {
   const { param, func } = useLogic();
   const { stage } = useStyle;

   const renderGameStage = () => {
      switch (param.gameType) {
         case 'LUCKY_DRAW': {
            return <GameLuckyDrawInterface game={param.selectedGame} />;
         }

         default: {
            return (
               <div className={stage.unsupported}>
                  <span className={stage.badge}>{param.gameType}</span>
                  <h2 className={stage.title}>{func.translate('title')}</h2>
                  <p className={stage.description}>{func.translate('description')}</p>
               </div>
            );
         }
      }
   };

   return (
      <div className={stage.wrapper}>
         {renderGameStage()}
         <GameSettings />
      </div>
   );
};
