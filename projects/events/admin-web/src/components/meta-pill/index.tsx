import { CopyButton } from '@admin-web/components/copy-button';

import { useStyle } from './use-style';

import type * as Types from './type';

export const MetaPill: Component<Types.Properties> = (properties) => {
   const { className, Icon, label, value, copyable } = properties;
   const { root } = useStyle;

   return (
      <div className={root.wrapper({ className })}>
         <Icon className={root.icon} />
         <span className={root.title}>{label}:</span>
         <span className={root.name}>{value}</span>
         {copyable && <CopyButton value={value} />}
      </div>
   );
};
