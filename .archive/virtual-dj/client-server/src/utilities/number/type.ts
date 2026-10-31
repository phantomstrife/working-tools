declare namespace Options {
   interface Random_Number {
      roundType?: 'up' | 'down' | 'keep';
      startFrom?: number;
   }
}

export type Random_Number = (min: number, max: number, options?: Options.Random_Number) => number;
