import { useStyle } from './use-style';

import type * as Types from './type';

export const StatusBadge: AdminWeb.Component<Types.Properties> = (properties) => {
   const { className, status = 'ACTIVE' } = properties;
   const { root, info } = useStyle;

   const { wrapper, dot } = root({
      status: status ?? undefined,
   });

   return (
      <div className={wrapper({ className })}>
         <span className={dot()} />
         <span className={info.text}>{status.toLocaleLowerCase()}</span>
      </div>
   );
};
