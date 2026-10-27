import { useCallback, useEffect } from 'react';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { useServicesGameLuckyDrawPrizesGet } from '@admin-web/services/game-lucky-draw/prizes-get';
import { useServicesGameGetStaff } from '@admin-web/services/game/get-staff';

import type * as Types from './type';

export function useLogic(properties: Types.Properties, refs: Types.PanelRefs) {
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
      const servicesGameLuckyDrawGetPrizes = await useServicesGameLuckyDrawPrizesGet({
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

   const synchronizeStats = useCallback(async () => {
      setState({
         loading: true,
      });

      await Promise.all([fetchPrizes(), fetchStaffs()]);

      setState({
         loading: false,
      });
   }, [setState, fetchPrizes, fetchStaffs]);

   const synchronizeData = useCallback(async () => {
      setState({
         loading: true,
      });

      await Promise.all([
         fetchPrizes(),
         fetchStaffs(),
         refs.attendants.current?.manualRefresh(),
         refs.prizes.current?.manualRefresh(),
         refs.staff.current?.manualRefresh(),
      ]);

      setState({
         loading: false,
      });
   }, [setState, fetchPrizes, fetchStaffs, refs]);

   useEffect(() => void synchronizeStats(), [synchronizeStats]);

   return {
      state,
      param: {
         game,
      },
      func: {
         translate,
         fetchPrizes: () => void fetchPrizes(),
         fetchStaffs: () => void fetchStaffs(),
         synchronizeData,
      },
   };
}
