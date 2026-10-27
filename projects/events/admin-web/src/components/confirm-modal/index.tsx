'use client';

import { Modal } from '@admin-web/components/modal';

import { useStyle } from './use-style';

import type * as Types from './type';

export const ConfirmModal: AdminWeb.Component<Types.Properties> = (properties) => {
   const {
      id,
      title,
      description,
      message,
      cancelLabel,
      confirmLabel,
      loadingLabel,
      isLoading = false,
      onConfirm,
   } = properties;

   const { message: messageStyle, cancel_button, confirm_button } = useStyle;

   return (
      <Modal
         id={id}
         disabled={isLoading}
         title={title}
         description={description}
         style={{ width: '28rem' }}
         footer={(close) => (
            <>
               <button
                  type="button"
                  disabled={isLoading}
                  className={cancel_button}
                  onClick={close}
               >
                  {cancelLabel}
               </button>
               <button
                  type="button"
                  disabled={isLoading}
                  className={confirm_button({ disabled: isLoading })}
                  onClick={() => void onConfirm()}
               >
                  {isLoading ? (loadingLabel ?? confirmLabel) : confirmLabel}
               </button>
            </>
         )}
      >
         <p className={messageStyle}>{message}</p>
      </Modal>
   );
};

