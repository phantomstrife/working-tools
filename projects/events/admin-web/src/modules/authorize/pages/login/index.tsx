import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOutIcon, MailIcon, LockIcon } from 'lucide-react';

import { ROLE, ROUTE } from '@/constants';
import { AuthService } from '@/services/authorize';

import { useStyle } from './use-style';

export const PageAuthorizeLogin: Router_Page = () => {
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
         const { role, companyId } = await AuthService.loginWithRoleCheck({
            email,
            password,
         });

         if (role === ROLE.SUPER_ADMIN) {
            router.push(ROUTE.MAIN.HOME);
         } else if (role === ROLE.ADMIN) {
            if (!companyId) {
               throw new Error('Admin account is not linked to a company.');
            }

            router.push(ROUTE.ADMIN.COMPANY.DASHBOARD(companyId));
         }
      } catch (error: unknown) {
         setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
         setLoading(false);
      }
   }

   const { wrapper, topBlock, errorBlock, formBlock, toolBlock } = useStyle;

   return (
      <form
         className={wrapper()}
         onSubmit={handleLogin}
      >
         <div className={topBlock.wrapper()}>
            <div className={topBlock.icon()}>
               <LogOutIcon />
            </div>
            <span className={topBlock.header()}>Login to Dashboard</span>
            <span className={topBlock.description()}>
               Sign in with your account to continue. If you have trouble logging in, please contact your administrator
               for help.
            </span>
         </div>
         <div className={formBlock.wrapper()}>
            <div className={formBlock.input.wrapper()}>
               <MailIcon />
               <input
                  type="email"
                  id="email"
                  className={formBlock.input.field()}
                  value={email}
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
               />
            </div>
            <div className={formBlock.input.wrapper()}>
               <LockIcon />
               <input
                  type="password"
                  id="password"
                  className={formBlock.input.field()}
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
               />
            </div>
         </div>
         {error && (
            <p
               className={errorBlock.wrapper()}
               role="alert"
            >
               {error}
            </p>
         )}
         <div className={toolBlock.wrapper()}>
            <button
               type="submit"
               className={toolBlock.button({ loading })}
               disabled={loading}
            >
               {loading ? 'Signing in...' : 'Sign in'}
            </button>
         </div>
      </form>
   );
};
