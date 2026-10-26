import { CopyButton } from '@admin-web/components/copy-button';

import { useStyle } from './use-style';

import type * as Types from './type';

export const MetaPill: AdminWeb.Component<Types.Properties> = (properties) => {
   const { className, Icon, label, value, copyable } = properties;
   const { root, info } = useStyle;

   return (
      <div className={root.wrapper({ className })}>
         <Icon className={info.icon} />
         <span className={info.title}>{label}:</span>
         <span className={info.name}>{value}</span>
         {copyable && <CopyButton value={value} />}
      </div>
   );
};
