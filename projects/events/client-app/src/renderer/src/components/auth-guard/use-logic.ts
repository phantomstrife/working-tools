import { useSession } from '@renderer/hooks/use-session';

import type { ReactNode } from 'react';

export type AuthGuardProps = {
   children: ReactNode;
};

export function useLogic(props: AuthGuardProps) {
   const { session, loading } = useSession();

   return {
      param: {
         session,
         loading,
         children: props.children,
      },
      func: {},
   };
}

