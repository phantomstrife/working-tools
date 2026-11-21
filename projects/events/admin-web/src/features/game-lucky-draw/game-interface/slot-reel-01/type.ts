export type Variant = 'default' | 'bordered' | 'split-flap';

export type Column_State = 'standby' | 'spinning' | 'locked';

export interface Properties {
   targetChar: string;
   isSpinning: boolean;
   variant?: Variant;
   status?: Column_State;
   columnIndex?: number;
   isVictory?: boolean;
   isVictoryRevealed?: boolean;
   className?: string;
   charClassName?: string;
}

export interface State {
   spinningChar: string;
}

