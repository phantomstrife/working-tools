import { useTranslate } from '@client-app/locale';
import { useStoreSession } from '@client-app/store/session';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.guard.check_in',
   });

   const selectedGameId = useStoreSession((store) => store.selectedGameId);
   const isLoadingAssignments = useStoreSession((store) => store.isLoadingAssignments);

   return {
      param: {
         selectedGameId,
         isLoadingAssignments,
      },
      func: {
         translate,
      },
   };
}

