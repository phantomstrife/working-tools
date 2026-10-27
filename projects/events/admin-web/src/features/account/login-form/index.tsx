'use client';

import { LogOutIcon, MailIcon, LockIcon } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageAuthorizeLogin: AdminWeb.Router.Page = () => {
   const { state, func } = useLogic();
   const { root, top, error, form, tool } = useStyle;

   return (
      <form
         className={root.wrapper}
         onSubmit={func.handleLogin}
      >
         <div className={top.wrapper}>
            <div className={top.icon}>
               <LogOutIcon />
            </div>
            <span className={top.header}>{func.translate('title')}</span>
            <span className={top.description}>{func.translate('description')}</span>
         </div>
         <div className={form.wrapper}>
            <div className={form.input.wrapper}>
               <MailIcon />
               <input
                  type="email"
                  id="email"
                  className={form.input.field}
                  value={state.email}
                  placeholder={func.translate('email_placeholder')}
                  onChange={(e) => func.setState(e.target.value, 'email')}
                  disabled={state.loading}
               />
            </div>
            <div className={form.input.wrapper}>
               <LockIcon />
               <input
                  type="password"
                  id="password"
                  className={form.input.field}
                  value={state.password}
                  placeholder={func.translate('password_placeholder')}
                  onChange={(e) => func.setState(e.target.value, 'password')}
                  disabled={state.loading}
               />
            </div>
         </div>
         {state.error && (
            <p
               className={error.wrapper}
               role="alert"
            >
               {state.error}
            </p>
         )}
         <div className={tool.wrapper}>
            <button
               type="submit"
               className={tool.button({ loading: state.loading })}
               disabled={state.loading}
            >
               {func.translate(`loading_${state.loading}`)}
            </button>
         </div>
      </form>
   );
};
