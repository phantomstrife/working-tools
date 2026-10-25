'use client';

import { LogOutIcon, MailIcon, LockIcon } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageAuthorizeLogin: Router.Page = () => {
   const { param, func } = useLogic();
   const { root, top_block, error_block, form_block, tool_block } = useStyle;

   return (
      <form
         className={root.wrapper}
         onSubmit={func.handleLogin}
      >
         <div className={top_block.wrapper}>
            <div className={top_block.icon}>
               <LogOutIcon />
            </div>
            <span className={top_block.header}>Login to Dashboard</span>
            <span className={top_block.description}>
               Sign in with your account to continue. If you have trouble logging in, please contact your administrator
               for help.
            </span>
         </div>
         <div className={form_block.wrapper}>
            <div className={form_block.input.wrapper}>
               <MailIcon />
               <input
                  type="email"
                  id="email"
                  className={form_block.input.field}
                  value={param.email}
                  placeholder="Email"
                  onChange={(e) => func.setEmail(e.target.value)}
                  disabled={param.loading}
               />
            </div>
            <div className={form_block.input.wrapper}>
               <LockIcon />
               <input
                  type="password"
                  id="password"
                  className={form_block.input.field}
                  value={param.password}
                  placeholder="Password"
                  onChange={(e) => func.setPassword(e.target.value)}
                  disabled={param.loading}
               />
            </div>
         </div>
         {param.error && (
            <p
               className={error_block.wrapper}
               role="alert"
            >
               {param.error}
            </p>
         )}
         <div className={tool_block.wrapper}>
            <button
               type="submit"
               className={tool_block.button({ loading: param.loading })}
               disabled={param.loading}
            >
               {param.loading ? 'Signing in...' : 'Sign in'}
            </button>
         </div>
      </form>
   );
};
