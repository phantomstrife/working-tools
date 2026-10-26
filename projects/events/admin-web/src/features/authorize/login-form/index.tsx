'use client';

import { LogOutIcon, MailIcon, LockIcon } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageAuthorizeLogin: Router.Page = () => {
   const { state, func } = useLogic();
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
            <span className={top_block.header}>{func.translate('title')}</span>
            <span className={top_block.description}>{func.translate('description')}</span>
         </div>
         <div className={form_block.wrapper}>
            <div className={form_block.input.wrapper}>
               <MailIcon />
               <input
                  type="email"
                  id="email"
                  className={form_block.input.field}
                  value={state.email}
                  placeholder={func.translate('email_placeholder')}
                  onChange={(e) => func.setState(e.target.value, 'email')}
                  disabled={state.loading}
               />
            </div>
            <div className={form_block.input.wrapper}>
               <LockIcon />
               <input
                  type="password"
                  id="password"
                  className={form_block.input.field}
                  value={state.password}
                  placeholder={func.translate('password_placeholder')}
                  onChange={(e) => func.setState(e.target.value, 'password')}
                  disabled={state.loading}
               />
            </div>
         </div>
         {state.error && (
            <p
               className={error_block.wrapper}
               role="alert"
            >
               {state.error}
            </p>
         )}
         <div className={tool_block.wrapper}>
            <button
               type="submit"
               className={tool_block.button({ loading: state.loading })}
               disabled={state.loading}
            >
               {func.translate(`loading_${state.loading}`)}
            </button>
         </div>
      </form>
   );
};
