import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { useStyle } from './use-style';

import type { UpsertStickyBarProps } from './type';

export function UpsertStickyBar({
   title,
   subtitle,
   saveLabel,
   savingLabel = 'Saving...',
   cancelLabel = 'Cancel',
   backAriaLabel = 'Go back',
   isDirty,
   isPending,
   onCancel,
}: UpsertStickyBarProps) {
   const {
      wrapper,
      leftGroup,
      backBtn,
      titleGroup,
      title: titleCls,
      subtitle: subtitleCls,
      actions,
      dirtyBadge,
      cancelBtn,
      saveBtn,
      iconSm,
      iconSpin,
   } = useStyle;

   const isDisabled = !isDirty || isPending;

   return (
      <div className={wrapper()}>
         <div className={leftGroup()}>
            <button
               type="button"
               onClick={onCancel}
               className={backBtn()}
               aria-label={backAriaLabel}
            >
               <ArrowLeft className={iconSm()} />
            </button>
            <div className={titleGroup()}>
               <h1 className={titleCls()}>{title}</h1>
               <span className={subtitleCls()}>{subtitle}</span>
            </div>
         </div>

         <div className={actions()}>
            {isDirty && <span className={dirtyBadge()}>Unsaved changes</span>}
            <button
               type="button"
               onClick={onCancel}
               className={cancelBtn()}
            >
               {cancelLabel}
            </button>
            <button
               type="submit"
               disabled={isDisabled}
               className={saveBtn({ disabled: isDisabled })}
            >
               {isPending ? <Loader2 className={iconSpin()} /> : <Save className={iconSm()} />}
               {isPending ? savingLabel : saveLabel}
            </button>
         </div>
      </div>
   );
}

