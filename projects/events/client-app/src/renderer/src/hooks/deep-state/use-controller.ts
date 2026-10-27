import { useState } from 'react';

import { useLogic } from './use-logic';

export function useController<M>(value: M) {
   const [state, setDeepState] = useState<M>(value);

   const logic = useLogic({
      value,
      setDeepState,
   });

   return {
      state,
      func: logic.func,
   };
}
