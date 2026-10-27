import { Sparkles } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageOperatorHome: ClientApp.Router.Page = () => {
   const { param, func } = useLogic();
   const { root } = useStyle;

   return (
      <div className={root.wrapper}>
         <div className={root.icon}>
            <Sparkles size={26} />
         </div>
         <span className={root.badge}>{func.translate('badge')}</span>
         <h2 className={root.title}>{func.translate('title')}</h2>
         <p className={root.description}>{func.translate('description')}</p>
         <div className={root.game_chip}>
            <span>{func.translate('selected_game')}:</span>
            <strong>
               {param.selectedEvent && param.selectedGame
                  ? `${param.selectedEvent.name} • ${param.selectedGame.name}`
                  : func.translate('no_game')}
            </strong>
         </div>
      </div>
   );
};

