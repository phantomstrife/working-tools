import { useRouter } from 'next/navigation';

import { useTranslate } from '@admin-web/locale';
import { useDeepState } from '@admin-web/hooks/deep-state';

import { useServiceAccountLogin } from '@admin-web/services/account/login';

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

   async function handleLogin(e: React.ChangeEvent<HTMLFormElement>) {
      e.preventDefault();

      setState({
         loading: true,
         error: '',
      });

      const serviceAccountLogin = await useServiceAccountLogin({
         email: state.email,
         password: state.password,
      });

      if (serviceAccountLogin.error) {
         setState({
            error: serviceAccountLogin.message,
            loading: false,
         });
         return;
      }

      router.refresh();
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
