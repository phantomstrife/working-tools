export type Variant = 'default' | 'bordered';

export interface Properties {
   targetChar: string;
   isSpinning: boolean;
   variant?: Variant;
   className?: string;
   charClassName?: string;
}

export interface State {
   spinningChar: string;
}

