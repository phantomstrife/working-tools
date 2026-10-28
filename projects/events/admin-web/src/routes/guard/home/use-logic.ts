import { useTranslate } from '@admin-web/locale';
import { useStoreSession } from '@admin-web/stores/session';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.guard.check_in',
   });

   const status = useStoreSession((store) => store.status);
   const selectedGameId = useStoreSession((store) => store.selectedGameId);
   const isLoadingAssignments = useStoreSession((store) => store.isLoadingAssignments);

   return {
      param: {
         selectedGameId,
         isLoading: status === 'LOADING' || isLoadingAssignments,
      },
      func: {
         translate,
      },
   };
}
