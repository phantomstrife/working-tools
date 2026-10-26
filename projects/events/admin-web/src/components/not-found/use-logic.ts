import { useTranslate } from '@admin-web/locale';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'components.not_found',
   });

   return {
      func: {
         translate,
      },
   };
}
