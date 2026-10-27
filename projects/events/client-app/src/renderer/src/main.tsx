import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { I18nProvider } from '@client-app/locale';
import { AppRouter } from '@client-app/routes';

import '@client-app/styles/theme.css';

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <I18nProvider>
         <AppRouter />
      </I18nProvider>
   </StrictMode>,
);
