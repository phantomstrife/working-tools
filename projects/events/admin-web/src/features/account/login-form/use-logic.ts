import { useRouter } from 'next/navigation';
import { ROUTE } from '@admin-web/routes/constants';
import { useTranslate } from '@admin-web/locale';
import { useDeepState } from '@admin-web/hooks/deep-state';

import { useServiceAccountLogin } from '@admin-web/services/account/login';

import type * as Types from './type';

export function useLogic() {
   const router = useRouter();

   const { translate } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      email: '',
      password: '',
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
            error: translate(serviceAccountLogin.message),
            loading: false,
         });
         return;
      }

      const { accountRole, companyId } = serviceAccountLogin.data;

      switch (accountRole) {
         case 'SUPER_ADMIN':
            router.replace(ROUTE.SUPER_ADMIN.HOME);
            break;
         case 'ADMIN':
            router.replace(companyId ? ROUTE.ADMIN.HOME(companyId) : ROUTE.AUTHORIZE.LOGIN);
            break;
         case 'FIELD_STAFF':
            router.replace(ROUTE.OPERATOR.HOME);
            break;
         case 'GUARD':
         default:
            router.replace(ROUTE.GUARD.HOME);
            break;
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
