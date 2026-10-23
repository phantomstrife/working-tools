import { EventLoader } from '@renderer/components/event-loader';
import { GatePage } from '@renderer/components/gate/gate-page';
import { LuckyDrawBoard } from '@renderer/components/lucky-draw/theme-02';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const RoleRouter = () => {
   const { param, func } = useLogic();
   const {
      loadingScreen,
      loadingPill,
      pulseDot,
      restrictedScreen,
      restrictedCard,
      restrictedBadge,
      restrictedTitle,
      restrictedDesc,
      restrictedSignOutBtn,
      topLeftBar,
      staffNameText,
      roleBadge,
      hudToggleBtn,
      signOutTopBtn,
   } = useStyle;

   if (param.loading) {
      return (
         <main className={loadingScreen()}>
            <div className={loadingPill()}>
               <span className={pulseDot()} />
               <span>Loading workspace...</span>
            </div>
         </main>
      );
   }

   if (!param.staff) {
      return (
         <main className={restrictedScreen()}>
            <div className={restrictedCard()}>
               <div className={restrictedBadge()}>Access Restricted</div>
               <h1 className={restrictedTitle()}>No Active Staff Profile</h1>
               <p className={restrictedDesc()}>
                  {param.error
                     ? `Could not verify your role (${param.error}).`
                     : 'Your account is not active or has not been assigned permissions. Contact an administrator.'}
               </p>
               <button
                  type="button"
                  onClick={func.handleSignOut}
                  className={restrictedSignOutBtn()}
               >
                  Sign Out
               </button>
            </div>
         </main>
      );
   }

   if (param.staff.role === 'GUARD') {
      return (
         <GatePage
            accountId={param.staff.id}
            fullName={param.staff.full_name}
            onSignOut={func.handleSignOut}
         />
      );
   }

   return (
      <>
         <LuckyDrawBoard />
         <EventLoader accountId={param.staff.id} />

         {!param.hideHud && (
            <div className={topLeftBar()}>
               <span
                  className={staffNameText()}
                  title={param.staff.full_name}
               >
                  {param.staff.full_name}
               </span>
               <span className={roleBadge()}>{param.staff.role}</span>
               <button
                  type="button"
                  onClick={func.handleToggleHud}
                  title="Hide HUD controls for stage projection (Press H to restore)"
                  className={hudToggleBtn()}
               >
                  Clean Stage (H)
               </button>
               <button
                  type="button"
                  onClick={func.handleSignOut}
                  className={signOutTopBtn()}
               >
                  Sign Out
               </button>
            </div>
         )}
      </>
   );
};
