'use client';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

// Diagonal "sold out" stamp overlay. The parent element must be `relative`.
export const SoldOutStamp: AdminWeb.Component<Types.Properties> = (properties) => {
   const { className } = properties;

   const { param } = useLogic(properties);
   const { wrapper, label } = useStyle.root({ size: param.size });

   return (
      <div
         className={wrapper({ className })}
         aria-hidden="true"
      >
         <span className={label()}>{param.text}</span>
      </div>
   );
};
