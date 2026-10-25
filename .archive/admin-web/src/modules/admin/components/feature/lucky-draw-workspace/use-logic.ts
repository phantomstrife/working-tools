import type { GameRow } from '@/modules/admin/services/company/overview/get-event-games/type';
import type {
   AssignedStaffMember,
   PrizeRow,
} from '@/modules/admin/services/company/overview/get-game-workspace/type';

export type LuckyDrawWorkspaceProps = {
   game: GameRow;
   companyId: string;
   prizes: PrizeRow[];
   staff: AssignedStaffMember[];
   isLoading: boolean;
   onRefresh: () => Promise<void>;
};

export function useLogic(props: LuckyDrawWorkspaceProps) {
   const { game, companyId, prizes, staff, isLoading, onRefresh } = props;

   return {
      param: {
         game,
         companyId,
         prizes,
         staff,
         isLoading,
      },
      func: {
         onRefresh,
      },
   };
}
