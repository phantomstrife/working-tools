import { useTranslate } from '@admin-web/locale';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: '',
   });

   return {
      func: {
         translate,
      },
   };
}
