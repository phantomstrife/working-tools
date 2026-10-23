import type { GameRow } from '@/modules/admin/services/company/overview/get-event-games/type';
import type {
   AssignedStaffMember,
   AttendantRow,
   PrizeRow,
} from '@/modules/admin/services/company/overview/get-game-workspace/type';

export type LuckyDrawWorkspaceProps = {
   game: GameRow;
   companyId: string;
   prizes: PrizeRow[];
   attendants: AttendantRow[];
   staff: AssignedStaffMember[];
   isLoading: boolean;
   onRefresh: () => Promise<void>;
};

export function useLogic(props: LuckyDrawWorkspaceProps) {
   const { game, companyId, prizes, attendants, staff, isLoading, onRefresh } = props;

   return {
      param: {
         game,
         companyId,
         prizes,
         attendants,
         staff,
         isLoading,
      },
      func: {
         onRefresh,
      },
   };
}

