import { useController } from './use-controller';

import type * as Types from './type';

export const useDeepState: Types.Hook = (value) => {
   const { state, func } = useController(value);

   return [
      state,
      func.setState,
      func.setStateRaw,
      func.resetState,
      //
   ];
};
