import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';
import { useStoreLuckyDraw } from '@admin-web/stores/lucky-draw';

import {
   BACKGROUND_CHECK_INTERVAL_MS,
   CLIENT_APP_BUILD_ID,
   CLIENT_APP_VERSION,
   FOCUS_CHECK_THROTTLE_MS,
   VERSION_API_ENDPOINT,
} from './constants';

import type * as Types from './type';

export function useLogic() {
   const pathname = usePathname();
   const hideHud = useStoreLuckyDraw((store) => store.hideHud);

   const { translate } = useTranslate({
      prefix: 'components.app_version_tag',
   });

   const [state, setState] = useDeepState<Types.State>({
      serverVersion: '',
      serverBuildId: '',
      isChecking: false,
   });

   const isMountedRef = useRef(true);
   const isCheckingRef = useRef(false);
   const lastCheckedAtRef = useRef(0);

   const checkVersion = useCallback(
      async (force = false) => {
         if (isCheckingRef.current) {
            return;
         }

         const now = Date.now();
         if (!force && now - lastCheckedAtRef.current < FOCUS_CHECK_THROTTLE_MS) {
            return;
         }

         isCheckingRef.current = true;
         lastCheckedAtRef.current = now;
         setState(true, 'isChecking');

         try {
            const response = await fetch(VERSION_API_ENDPOINT, {
               cache: 'no-store',
            });

            if (response.ok) {
               const payload = (await response.json()) as Types.Version_Payload;

               if (isMountedRef.current) {
                  setState({
                     serverVersion: typeof payload.version === 'string' ? payload.version.trim() : '',
                     serverBuildId: typeof payload.buildId === 'string' ? payload.buildId.trim() : '',
                  });
               }
            }
         } catch {
            // Silently ignore transient network or offline errors
         } finally {
            isCheckingRef.current = false;

            if (isMountedRef.current) {
               setState(false, 'isChecking');
            }
         }
      },
      [setState],
   );

   useEffect(() => {
      isMountedRef.current = true;
      void checkVersion(true);

      const handleFocus = () => {
         void checkVersion(false);
      };

      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
            void checkVersion(false);
         }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const intervalId = window.setInterval(() => {
         void checkVersion(true);
      }, BACKGROUND_CHECK_INTERVAL_MS);

      return () => {
         isMountedRef.current = false;
         window.removeEventListener('focus', handleFocus);
         document.removeEventListener('visibilitychange', handleVisibilityChange);
         window.clearInterval(intervalId);
      };
   }, [checkVersion]);

   const isVersionMismatch = Boolean(state.serverVersion && state.serverVersion !== CLIENT_APP_VERSION);
   const isBuildMismatch = Boolean(
      CLIENT_APP_BUILD_ID && state.serverBuildId && state.serverBuildId !== CLIENT_APP_BUILD_ID,
   );
   const hasMismatch = isVersionMismatch || isBuildMismatch;

   const isOperatorStage = Boolean(pathname && pathname.startsWith('/operator/') && pathname !== '/operator');
   const isHidden = isOperatorStage && hideHud;

   const handleClick = useCallback(() => {
      if (hasMismatch) {
         window.location.reload();
         return;
      }

      void checkVersion(true);
   }, [checkVersion, hasMismatch]);

   const clientLabel = `v${CLIENT_APP_VERSION}`;
   const serverLabel = state.serverVersion ? `v${state.serverVersion}` : clientLabel;
   const clientDetail = CLIENT_APP_BUILD_ID ? `${clientLabel} (${CLIENT_APP_BUILD_ID})` : clientLabel;
   const serverDetail = state.serverVersion
      ? state.serverBuildId
         ? `${serverLabel} (${state.serverBuildId})`
         : serverLabel
      : clientDetail;

   const displayText = hasMismatch
      ? isVersionMismatch
         ? `${clientLabel} → ${serverLabel}`
         : `${clientLabel} · ${translate('update_label')}`
      : clientLabel;

   const tooltip = hasMismatch
      ? translate('tooltip_mismatch', {
           client: clientDetail,
           server: serverDetail,
        })
      : state.isChecking
        ? translate('checking')
        : translate('tooltip_synced', {
             client: clientDetail,
             server: serverDetail,
          });

   return {
      state,
      param: {
         isHidden,
         hasMismatch,
         displayText,
         tooltip,
      },
      func: {
         handleClick,
      },
   };
}
