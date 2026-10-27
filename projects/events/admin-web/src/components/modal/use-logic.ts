import { useCallback, useEffect, useRef } from 'react';

import type * as Types from './type';

export function useLogic({ state, properties, contentRef, setState }: Types.UseLogic) {
   const scrollY = useRef(0);

   const latestRef = useRef({
      state,
      properties,
   });

   useEffect(() => {
      latestRef.current = {
         state,
         properties,
      };
   });

   const open: Types.Open = useCallback(
      (event) => {
         const current = latestRef.current;

         if (current.state.status === 'open' || current.state.disabled) {
            return;
         }

         if (document.querySelectorAll('.modal-instance').length === 0) {
            scrollY.current = window.scrollY;
            document.body.classList.add('modal-open');
         }

         setState('open', 'status');
         current.properties.onOpen?.();

         if (event) {
            event.stopPropagation();
         }
      },
      [setState],
   );

   const close: Types.Close = useCallback(() => {
      const current = latestRef.current;

      if (current.state.disabled) {
         return;
      }

      if (document.querySelectorAll('.modal-instance').length <= 1) {
         document.body.classList.remove('modal-open');
         window.scrollTo(0, scrollY.current);
      }

      setState('close', 'status');
      current.properties.onClose?.();
   }, [setState]);

   useEffect(() => {
      if (state.status !== 'open') {
         return;
      }

      const onClick: Types.OnClick = (event) => {
         const current = latestRef.current;

         if (!contentRef.current || current.state.status !== 'open' || current.properties.manualClose) {
            return;
         }

         const body = document.body;
         const target = event.target as HTMLElement;
         const scrollbarWidth = 8;

         if (scrollbarWidth > 0) {
            const { clientX } = event;
            const { left, width } = body.getBoundingClientRect();

            if (clientX >= left + width - scrollbarWidth) {
               return;
            }
         }

         const insideModal = contentRef.current.contains(target);
         const insideToast = target.closest('[data-sonner-toaster]');

         if (insideModal || insideToast) {
            return;
         }

         close();
      };

      const onKeyDown: Types.OnKeyDown = (event) => {
         const current = latestRef.current;

         if (event.key === 'Escape' && !current.properties.manualClose) {
            close();
         }
      };

      document.addEventListener('mousedown', onClick);
      document.addEventListener('keydown', onKeyDown);

      return () => {
         document.removeEventListener('mousedown', onClick);
         document.removeEventListener('keydown', onKeyDown);
      };
   }, [state.status, contentRef, close]);

   return {
      func: {
         close,
         open,
      },
   };
}
