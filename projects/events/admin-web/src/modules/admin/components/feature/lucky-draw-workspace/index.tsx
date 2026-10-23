'use client';

import { AttendantsPanel } from './attendants-panel';
import { StaffPanel } from './staff-panel';
import { useStyle } from './use-style';

import type { GameRow } from '@/modules/admin/services/company/overview/get-event-games/type';
import type {
   AssignedStaffMember,
   AttendantRow,
} from '@/modules/admin/services/company/overview/get-game-workspace/type';

export type LuckyDrawWorkspaceProps = {
   game: GameRow;
   attendants: AttendantRow[];
   staff: AssignedStaffMember[];
   isLoading: boolean;
};

export const LuckyDrawWorkspace = (props: LuckyDrawWorkspaceProps) => {
   const { game, attendants, staff, isLoading } = props;
   const { wrapper, workspaceBar, workspaceTitleGroup, workspaceBadge, workspaceTitle, workspaceHint, grid } =
      useStyle;

   return (
      <section className={wrapper()}>
         <div className={workspaceBar()}>
            <div className={workspaceTitleGroup()}>
               <span className={workspaceBadge()}>{game.game_type}</span>
               <h2 className={workspaceTitle()}>{game.name}</h2>
            </div>
            <span className={workspaceHint()}>
               Status: {game.status ?? 'PENDING'} • Live Attendants & Assigned Venue Staff
            </span>
         </div>

         <div className={grid()}>
            <AttendantsPanel
               gameId={game.id}
               attendants={attendants}
               isLoading={isLoading}
            />

            <StaffPanel
               staff={staff}
               isLoading={isLoading}
            />
         </div>
      </section>
   );
};

