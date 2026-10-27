import { useStyle } from './use-style';

import type * as Types from './type';

export function FormField(properties: Types.Properties) {
   const { id, className, Icon, label, required = false, hint, error, children } = properties;
   const { root, left, right, control, bottom } = useStyle;

   return (
      <div className={root.wrapper({ className })}>
         <div className={left.wrapper}>
            {Icon && (
               <Icon
                  className={left.icon}
                  size={15}
               />
            )}
            <span className={left.label}>{label}</span>
            {required && <span className={left.required}>*</span>}
         </div>
         {hint && <span className={bottom.hint}>{hint}</span>}
         {error && <span className={right.error}>{error}</span>}
         <label
            htmlFor={id}
            className={control({ error: !!error })}
         >
            {children}
         </label>
      </div>
   );
}
