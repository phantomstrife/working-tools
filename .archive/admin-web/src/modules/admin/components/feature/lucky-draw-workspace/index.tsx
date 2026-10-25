'use client';

import { AttendantsPanel } from './attendants-panel';
import { PrizesPanel } from './prizes-panel';
import { StaffPanel } from './staff-panel';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { LuckyDrawWorkspaceProps } from './use-logic';

export const LuckyDrawWorkspace = (props: LuckyDrawWorkspaceProps) => {
   const { param, func } = useLogic(props);
   const { wrapper, workspaceBar, workspaceTitleGroup, workspaceBadge, workspaceTitle, workspaceHint } = useStyle;

   return (
      <section className={wrapper()}>
         <div className={workspaceBar()}>
            <div className={workspaceTitleGroup()}>
               <span className={workspaceBadge()}>{param.game.game_type}</span>
               <h2 className={workspaceTitle()}>{param.game.name}</h2>
            </div>
            <span className={workspaceHint()}>
               Status: {param.game.status ?? 'PENDING'} • Prizes, Live Attendants & Assigned Venue Staff
            </span>
         </div>

         <AttendantsPanel
            key={param.game.id}
            gameId={param.game.id}
         />

         <PrizesPanel
            gameId={param.game.id}
            prizes={param.prizes}
            isLoading={param.isLoading}
            onRefresh={func.onRefresh}
         />

         <StaffPanel
            gameId={param.game.id}
            eventId={param.game.event_id}
            companyId={param.companyId}
            staff={param.staff}
            isLoading={param.isLoading}
            onRefresh={func.onRefresh}
         />
      </section>
   );
};
