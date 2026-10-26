'use client';

import i18n from 'i18next';
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';

import { vi } from '@admin-web/locale/vi';

i18n.use(initReactI18next).init({
   resources: {
      vi: { translation: vi },
   },
   lng: 'vi',
   fallbackLng: 'vi',
   interpolation: { escapeValue: false },
});

export const I18nProvider: AdminWeb.Component = ({ children }) => {
   return (
      <I18nextProvider i18n={i18n}>
         {children}
         <Toaster
            position="bottom-right"
            richColors
         />
      </I18nextProvider>
   );
};

export function useTranslate(options: { prefix: string }) {
   const { t } = useTranslation('translation', {
      keyPrefix: options.prefix,
   });

   return {
      translate: t,
   };
}
