'use client';

import { LuckyDrawBoard as LuckyDrawTheme02 } from './theme-02';
import { LuckyDrawBoardTheme03 } from './theme-03';

import type * as Types from './type';

const resolveTheme = (config: unknown): Types.Theme_Name => {
   if (typeof config === 'object' && config !== null && !Array.isArray(config)) {
      const theme = (config as Record<string, unknown>).theme;
      if (theme === 'theme-02' || theme === 'theme-03') {
         return theme;
      }
   }

   return 'theme-02';
};

export const GameLuckyDrawInterface: AdminWeb.Component<Types.Properties> = (properties) => {
   const { game } = properties;

   if (!game) {
      return null;
   }

   const theme = resolveTheme(game.config);

   switch (theme) {
      case 'theme-03': {
         return <LuckyDrawBoardTheme03 />;
      }

      case 'theme-02':
      default: {
         return <LuckyDrawTheme02 />;
      }
   }
};

