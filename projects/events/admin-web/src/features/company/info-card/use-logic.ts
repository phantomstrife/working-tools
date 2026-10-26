import { useTranslate } from '@admin-web/locale';

export function useLogic() {
   const { translate } = useTranslate({
      prefix: 'features.company.info_card',
   });

   return {
      func: {
         translate,
      },
   };
}
