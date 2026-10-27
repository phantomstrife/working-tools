import { useCallback, useRef } from 'react';

import { isObject } from '@client-app/utilities/object';

import type * as Types from './type';

export function useLogic<M>({ value, setDeepState }: Types.UseLogic<M>) {
   const cache = useRef<Types.Cache<M>>({
      value: structuredClone(value),
   });

   const setState: Types.Set_State<M> = useCallback(
      (value, key1, key2, key3) => {
         setDeepState((previous) => {
            if (key1 !== undefined && key2 !== undefined && key3 !== undefined) {
               const key1Value = previous[key1];
               const key1SafeValue: Types.Object = isObject(key1Value) ? key1Value : {};

               const key2Value = key1SafeValue[key2 as string];
               const key2SafeValue: Types.Object = isObject(key2Value) ? key2Value : {};

               if (key2SafeValue[key3] === value) {
                  return previous;
               }

               return {
                  ...previous,
                  [key1]: {
                     ...key1SafeValue,
                     [key2]: {
                        ...key2SafeValue,
                        [key3]: value,
                     },
                  },
               };
            }

            if (key1 !== undefined && key2 !== undefined) {
               const key1Value = previous[key1];
               const key1SafeValue: Types.Object = isObject(key1Value) ? key1Value : {};

               if (key1SafeValue[key2 as string] === value) {
                  return previous;
               }

               return {
                  ...previous,
                  [key1]: {
                     ...key1SafeValue,
                     [key2]: value,
                  },
               };
            }

            if (key1 !== undefined) {
               if (previous[key1] === value) {
                  return previous;
               }

               return {
                  ...previous,
                  [key1]: value,
               };
            }

            if (isObject(value)) {
               const keys = Object.keys(value) as Array<keyof M>;
               const hasChanged = keys.some((k) => previous[k] !== value[k]);

               if (!hasChanged) {
                  return previous;
               }

               return {
                  ...previous,
                  ...value,
               };
            }

            if (previous === value) {
               return previous;
            }

            return value as M;
         });
      },
      [setDeepState],
   );

   const resetState: Types.Reset_State<M> = useCallback(
      (state = cache.current.value) => {
         setDeepState(state);
      },
      [setDeepState],
   );

   return {
      func: {
         resetState,
         setState,
         setStateRaw: setDeepState,
      },
   };
}
