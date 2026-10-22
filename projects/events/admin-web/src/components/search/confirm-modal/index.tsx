import { AlertTriangle, Loader2 } from 'lucide-react';

import { useStyle } from './use-style';

import type { ConfirmDeleteModalProps } from './type';

export function ConfirmDeleteModal({
   isOpen,
   title,
   entityName,
   descriptionSuffix = 'This action cannot be undone.',
   confirmLabel = 'Delete',
   isPending = false,
   onCancel,
   onConfirm,
}: ConfirmDeleteModalProps) {
   const {
      backdrop,
      dialog,
      header,
      dangerIconBox,
      titleGroup,
      title: titleCls,
      description,
      highlight,
      footer,
      cancelBtn,
      confirmDeleteBtn,
      iconMd,
      iconSpin,
   } = useStyle;

   if (!isOpen) {
      return null;
   }

   return (
      <div className={backdrop()}>
         <div
            className={dialog()}
            role="dialog"
            aria-modal="true"
         >
            <div className={header()}>
               <div className={dangerIconBox()}>
                  <AlertTriangle className={iconMd()} />
               </div>
               <div className={titleGroup()}>
                  <h2 className={titleCls()}>{title}</h2>
                  <p className={description()}>
                     Are you sure you want to permanently delete <span className={highlight()}>{entityName}</span>?{' '}
                     {descriptionSuffix}
                  </p>
               </div>
            </div>

            <div className={footer()}>
               <button
                  type="button"
                  onClick={onCancel}
                  className={cancelBtn()}
               >
                  Cancel
               </button>
               <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isPending}
                  className={confirmDeleteBtn({ disabled: isPending })}
               >
                  {isPending && <Loader2 className={iconSpin()} />}
                  {confirmLabel}
               </button>
            </div>
         </div>
      </div>
   );
}

