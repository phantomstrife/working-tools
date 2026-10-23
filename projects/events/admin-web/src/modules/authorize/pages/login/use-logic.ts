import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ROUTE } from '@/constants';
import { login } from '@/modules/authorize/services/login';

export function useLogic() {
   const router = useRouter();

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      setLoading(true);
      setError('');

      try {
         const { accountRole, companyId } = await login({
            email,
            password,
         });

         switch (accountRole) {
            case 'SUPER_ADMIN': {
               router.push(ROUTE.ADMIN.COMPANY.SEARCH);
               break;
            }

            case 'ADMIN': {
               if (!companyId) {
                  throw new Error('Admin account is not linked to a company.');
               }

               router.push(ROUTE.ADMIN.COMPANY.OVERVIEW);
               break;
            }
         }
      } catch (error: unknown) {
         setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
         setLoading(false);
      }
   }

   return {
      param: {
         loading,
         email,
         password,
         error,
      },
      func: {
         setEmail,
         setPassword,
         handleLogin,
      },
   };
}
