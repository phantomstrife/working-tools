'use client';

import { useRef } from 'react';
import { X } from 'lucide-react';

import { useController } from './use-controller';
import { useStyle } from './use-style';

import type * as Types from './type';

const resolveRenderProp = (prop: Types.RenderProp | undefined, close: () => void): Types.ReactNode => {
   if (typeof prop === 'function') {
      return prop(close);
   }

   return prop;
};

export const Modal: AdminWeb.Component<Types.Properties> = (properties) => {
   const { hideCloseButton = false, title, description, footer, children } = properties;

   const contentRef = useRef<HTMLDivElement>(null);

   const { state, func } = useController(properties, contentRef);
   const { style, variable } = useStyle(properties, state);

   const resolvedTitle = resolveRenderProp(title, func.close);
   const resolvedFooter = resolveRenderProp(footer, func.close);
   const resolvedChildren = resolveRenderProp(children, func.close);

   return (
      <div
         className={style.main.container}
         style={variable}
         role="dialog"
         aria-modal={state.status === 'open'}
      >
         <div
            ref={contentRef}
            className={style.main.wrapper}
         >
            {(resolvedTitle || description || !hideCloseButton) && (
               <div className={style.modal.header.wrapper}>
                  <div className={style.modal.header.content}>
                     <div className={style.modal.header.title}>{resolvedTitle}</div>
                     {description && <p className={style.modal.header.description}>{description}</p>}
                  </div>
                  {!hideCloseButton && (
                     <button
                        type="button"
                        aria-label="Close modal"
                        className={style.modal.header.close}
                        onClick={func.close}
                     >
                        <X className={style.modal.header.close_icon} />
                     </button>
                  )}
               </div>
            )}

            <div
               className={style.modal.body}
               aria-label="body"
            >
               {state.status !== 'init' && resolvedChildren}
            </div>

            {state.status !== 'init' && resolvedFooter && <div className={style.modal.footer}>{resolvedFooter}</div>}
         </div>
      </div>
   );
};

export { useStoreModal } from '../../stores/modal';
