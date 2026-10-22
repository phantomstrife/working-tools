import './assets/main.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthGuard } from '@renderer/components/AuthGuard';
import { RoleRouter } from '@renderer/components/RoleRouter';

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <AuthGuard>
         <RoleRouter />
      </AuthGuard>
   </StrictMode>,
);