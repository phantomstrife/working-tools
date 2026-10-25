import './assets/main.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthGuard } from '@renderer/components/auth-guard';
import { RoleRouter } from '@renderer/components/role-router';

const rootEl = document.getElementById('root');

if (rootEl) {
   createRoot(rootEl).render(
      <StrictMode>
         <AuthGuard>
            <RoleRouter />
         </AuthGuard>
      </StrictMode>,
   );
}
