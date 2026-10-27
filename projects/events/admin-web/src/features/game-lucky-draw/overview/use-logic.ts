import { useCallback, useEffect } from 'react';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { useServicesGameLuckyDrawGetPrizes } from '@admin-web/services/game-lucky-draw/get-prizes';
import { useServicesGameGetStaff } from '@admin-web/services/game/get-staff';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { game } = properties;

   const { translate } = useTranslate({
      prefix: 'features.game_luck_draw.overview',
   });

   const [state, setState] = useDeepState<Types.State>({
      loading: false,
      prizeCount: 0,
      staffCount: 0,
   });

   const fetchPrizes = useCallback(async () => {
      const servicesGameLuckyDrawGetPrizes = await useServicesGameLuckyDrawGetPrizes({
         id: game.id,
      });

      if (servicesGameLuckyDrawGetPrizes.error) {
         return;
      }

      const prizes = servicesGameLuckyDrawGetPrizes.data.prizes;
      const prizeCount = prizes.reduce((sum, prize) => sum + prize.remaining_quantity, 0);

      setState(prizeCount, 'prizeCount');
   }, [game.id, setState]);

   const fetchStaffs = useCallback(async () => {
      const servicesGameGetStaff = await useServicesGameGetStaff({
         id: game.id,
      });

      if (servicesGameGetStaff.error) {
         return;
      }

      const staffCount = servicesGameGetStaff.data.accounts.length;

      setState(staffCount, 'staffCount');
   }, [game.id, setState]);

   const synchronizeData = useCallback(async () => {
      setState({
         loading: true,
      });

      await Promise.all([fetchPrizes(), fetchStaffs()]);

      setState({
         loading: false,
      });
   }, [setState, fetchPrizes, fetchStaffs]);

   useEffect(() => void synchronizeData(), [synchronizeData]);

   return {
      state,
      param: {
         game,
      },
      func: {
         translate,
         synchronizeData,
      },
   };
}
