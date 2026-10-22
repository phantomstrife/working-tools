import { useStyle } from './use-style';

import type { UpsertAuditFooterProps } from './type';

export function UpsertAuditFooter({ items }: UpsertAuditFooterProps) {
   const { wrapper, item, label, value } = useStyle;

   if (items.length === 0) {
      return null;
   }

   return (
      <section className={wrapper()}>
         {items.map((entry) => (
            <div
               key={entry.label}
               className={item()}
            >
               <span className={label()}>{entry.label}</span>
               <span className={value()}>{entry.value}</span>
            </div>
         ))}
      </section>
   );
}

