import { useStyle } from './use-style';

import type * as Types from './type';

export function FormField(properties: Types.Properties) {
   const { id, className, Icon, label, required = false, hint, error, children } = properties;
   const { root, left_block, right_block, control, bottom_block } = useStyle;

   return (
      <div className={root.wrapper({ className })}>
         <div className={left_block.wrapper}>
            {Icon && (
               <Icon
                  className={left_block.icon}
                  size={15}
               />
            )}
            <span className={left_block.label}>{label}</span>
            {required && <span className={left_block.required}>*</span>}
         </div>
         {hint && <span className={bottom_block.hint}>{hint}</span>}
         {error && <span className={right_block.error}>{error}</span>}
         <label
            htmlFor={id}
            className={control({ error: !!error })}
         >
            {children}
         </label>
      </div>
   );
}
