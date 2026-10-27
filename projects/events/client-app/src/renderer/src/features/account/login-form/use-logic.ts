import { useNavigate } from 'react-router';

import { useDeepState } from '@client-app/hooks/deep-state';
import { useTranslate } from '@client-app/locale';
import { resolveHomeRoute } from '@client-app/routes/helpers';
import { useServicesAccountLogin } from '@client-app/services/account/login';
import { useStoreSession } from '@client-app/store/session';

import type * as Types from './type';

export function useLogic() {
   const navigate = useNavigate();
   const setAuthenticated = useStoreSession((store) => store.setAuthenticated);

   const { translate } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      email: '',
      password: '',
      loading: false,
      error: '',
   });

   async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      setState({
         loading: true,
         error: '',
      });

      const serviceAccountLogin = await useServicesAccountLogin({
         email: state.email,
         password: state.password,
      });

      if (serviceAccountLogin.error) {
         setState({
            error: translate(serviceAccountLogin.message),
            loading: false,
         });
         return;
      }

      setAuthenticated(serviceAccountLogin.data);
      navigate(resolveHomeRoute(serviceAccountLogin.data.role), { replace: true });
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
