export interface Properties {
   className?: string;
   value: string;
}

export interface State {
   executed: boolean;
}

export type Handle_Copy = (value: string) => void;
