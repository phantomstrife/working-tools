import { useStyle } from './use-style';

import type { UpsertSectionCardProps } from './type';

export function UpsertSectionCard({ title, description, children }: UpsertSectionCardProps) {
   const { wrapper, header, title: titleCls, description: descriptionCls, grid } = useStyle;

   return (
      <section className={wrapper()}>
         <div className={header()}>
            <h2 className={titleCls()}>{title}</h2>
            {description && <span className={descriptionCls()}>{description}</span>}
         </div>

         <div className={grid()}>{children}</div>
      </section>
   );
}

