'use client';

import i18n from 'i18next';
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next';

import { vi } from '@admin-web/locale/vi';

i18n.use(initReactI18next).init({
   resources: {
      vi: { translation: vi },
   },
   lng: 'vi',
   fallbackLng: 'vi',
   interpolation: { escapeValue: false },
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
   return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useTranslate(options: { prefix: string }) {
   const { t } = useTranslation('translation', {
      keyPrefix: options.prefix,
   });

   return {
      translate: t,
   };
}
