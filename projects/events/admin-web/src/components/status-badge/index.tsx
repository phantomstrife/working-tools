import { useStyle } from './use-style';

import type * as Types from './type';

export const StatusBadge: Component<Types.Properties> = (properties) => {
   const { className, status = 'ACTIVE' } = properties;
   const { root } = useStyle;

   const { wrapper, dot } = root.status({
      status: status ?? undefined,
   });

   return (
      <div className={wrapper({ className })}>
         <span className={dot()} />
         <span className={root.text}>{status.toLocaleLowerCase()}</span>
      </div>
   );
};
