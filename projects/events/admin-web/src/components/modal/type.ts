import type { RefObject } from 'react';
import type * as DeepStateTypes from '@admin-web/hooks/deep-state/type';

export type ReactNode = AdminWeb.ReactNode;
export type RenderProp = ReactNode | ((close: () => void) => ReactNode);

export interface Styles {
   className?: string;
   bodyClass?: string;
   closeButtonClass?: string;
   headerClass?: string;
   footerClass?: string;
   radius?: string;
   width?: string;
}

export interface Properties {
   id: string;
   hideCloseButton?: boolean;
   manualClose?: boolean;
   title?: RenderProp;
   description?: ReactNode;
   footer?: RenderProp;
   disabled?: boolean;
   style?: Styles;
   children?: RenderProp;
   onClose?: () => void;
   onOpen?: () => void;
}

export interface State {
   status: Status;
   disabled: boolean;
}

export interface UseLogic {
   state: State;
   properties: Properties;
   contentRef: RefObject<HTMLDivElement | null>;
   setState: DeepStateTypes.Set_State<State>;
}

export type Status = 'init' | 'open' | 'close';
export type Open = AdminWeb.Store.Modal.Functions['open'];
export type Close = AdminWeb.Store.Modal.Functions['close'];
export type OnClick = (event: MouseEvent) => void;
export type OnKeyDown = (event: KeyboardEvent) => void;
