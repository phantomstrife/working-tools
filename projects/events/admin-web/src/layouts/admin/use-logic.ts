import { useTranslate } from '@admin-web/locale';
import { useState } from 'react';

export function useLogic() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const { translate } = useTranslate('layouts.admin');

   return {
      param: {
         isSidebarOpen,
      },
      func: {
         translate,
         setIsSidebarOpen,
      },
   };
}
