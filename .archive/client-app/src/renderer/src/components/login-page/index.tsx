import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LoginPage = () => {
   const { param, func } = useLogic();
   const { page, formCard, headerBlock, badge, title, subtitle, label, input, errorText, submitBtn } = useStyle;

   return (
      <main className={page()}>
         <form
            onSubmit={func.handleLogin}
            className={formCard()}
         >
            <div className={headerBlock()}>
               <span className={badge()}>Venue Terminal</span>
               <h1 className={title()}>Staff & Operator Sign In</h1>
               <p className={subtitle()}>
                  Sign in with your assigned Field Staff, Guard, or Admin credentials.
               </p>
            </div>

            <label className={label()}>
               <span>Email</span>
               <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="staff@company.com"
                  value={param.email}
                  onChange={func.handleEmailChange}
                  className={input()}
               />
            </label>

            <label className={label()}>
               <span>Password</span>
               <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={param.password}
                  onChange={func.handlePasswordChange}
                  className={input()}
               />
            </label>

            {param.error && <p className={errorText()}>{param.error}</p>}

            <button
               type="submit"
               disabled={param.loading}
               className={submitBtn({ disabled: param.loading })}
            >
               {param.loading ? 'Signing in...' : 'Sign In'}
            </button>
         </form>
      </main>
   );
};

