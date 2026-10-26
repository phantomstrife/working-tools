import { useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { useDeepState } from '@admin-web/hooks/deep-state';

import { login } from '@admin-web/services/authorize/login';

import type * as Types from './type';

export function useLogic() {
   const router = useRouter();

   const { translate } = useTranslate({
      prefix: 'features.authorize.login_form',
   });

   const [state, setState] = useDeepState<Types.State>({
      email: 'nguyenthaihoanganh2606@gmail.com',
      password: 'abcd@1234',
      loading: false,
      error: '',
   });

   async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      setState({
         loading: true,
         error: '',
      });

      try {
         await login({
            email: state.email,
            password: state.password,
         });

         router.refresh();
      } catch (error: unknown) {
         setState({
            error: error instanceof Error ? error.message : 'An unexpected error occurred.',
            loading: false,
         });
      }
   }

   return {
      state,
      func: {
         translate,
         setState,
         handleLogin,
      },
   };
}
