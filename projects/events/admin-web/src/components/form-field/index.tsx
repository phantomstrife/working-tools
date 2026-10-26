import { useStyle } from './use-style';

import type * as Types from './type';

export function FormField(properties: Types.Properties) {
   const { id, className, label, required = false, hint, error, children } = properties;
   const { root, header, control, footer } = useStyle;

   return (
      <div className={root.wrapper({ className })}>
         <label
            htmlFor={id}
            className={header.wrapper}
         >
            {label}
            {required && <span className={header.required}>*</span>}
         </label>

         <div
            className={control({ hasError: !!error })}
            role="form"
         >
            {children}
         </div>

         {hint && <span className={footer.hint}>{hint}</span>}
         {error && <span className={footer.error}>{error}</span>}
      </div>
   );
}
