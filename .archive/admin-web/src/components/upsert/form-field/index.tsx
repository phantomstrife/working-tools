import { useStyle } from './use-style';

import type { FormFieldProps } from './type';

export const formControlStyle = {
   input: useStyle.input,
   select: useStyle.select,
   textarea: useStyle.textarea,
};

export function FormField({
   id,
   label,
   required = false,
   fullSpan = false,
   hint,
   error,
   children,
}: FormFieldProps) {
   const { wrapper, label: labelCls, requiredMark, hint: hintCls, error: errorCls } = useStyle;

   return (
      <div className={wrapper({ fullSpan })}>
         <label
            htmlFor={id}
            className={labelCls()}
         >
            {label}
            {required && <span className={requiredMark()}>*</span>}
         </label>

         {children}

         {hint && <span className={hintCls()}>{hint}</span>}
         {error && <span className={errorCls()}>{error}</span>}
      </div>
   );
}

