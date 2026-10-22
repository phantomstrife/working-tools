import { LogOutIcon, MailIcon, LockIcon } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageAuthorizeLogin: Router_Page = () => {
   const { param, func } = useLogic();
   const { wrapper, topBlock, errorBlock, formBlock, toolBlock } = useStyle;

   return (
      <form
         className={wrapper()}
         onSubmit={func.handleLogin}
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
                  value={param.email}
                  placeholder="Email"
                  onChange={(e) => func.setEmail(e.target.value)}
                  disabled={param.loading}
               />
            </div>
            <div className={formBlock.input.wrapper()}>
               <LockIcon />
               <input
                  type="password"
                  id="password"
                  className={formBlock.input.field()}
                  value={param.password}
                  placeholder="Password"
                  onChange={(e) => func.setPassword(e.target.value)}
                  disabled={param.loading}
               />
            </div>
         </div>
         {param.error && (
            <p
               className={errorBlock.wrapper()}
               role="alert"
            >
               {param.error}
            </p>
         )}
         <div className={toolBlock.wrapper()}>
            <button
               type="submit"
               className={toolBlock.button({ loading: param.loading })}
               disabled={param.loading}
            >
               {param.loading ? 'Signing in...' : 'Sign in'}
            </button>
         </div>
      </form>
   );
};
