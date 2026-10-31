import type * as Types from './type';

export const random: Types.Random_Number = (min, max, options = {}) => {
   const { roundType = 'down' } = options;

   if (min > max) {
      [min, max] = [max, min];
   }

   const rand = Math.random() * (max - min);

   switch (roundType) {
      case 'down': {
         return Math.floor(rand) + min;
      }

      case 'up': {
         return Math.ceil(rand) + min;
      }

      default: {
         return rand + min;
      }
   }
};
