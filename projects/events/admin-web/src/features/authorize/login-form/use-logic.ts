import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { login } from '@admin-web/services/authorize/login';

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
         await login({
            email,
            password,
         });

         router.refresh();
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
