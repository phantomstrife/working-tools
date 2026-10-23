'use client';

import { Building2, Gamepad2 } from 'lucide-react';
import { Toaster } from 'sonner';

import { CompanyInfoCard } from '@/modules/admin/components/feature/company-info-card';
import { EventGameSelector } from '@/modules/admin/components/feature/event-game-selector';
import { LuckyDrawWorkspace } from '@/modules/admin/components/feature/lucky-draw-workspace';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageAdminCompanyOverview: Router_Page = () => {
   const { param, func } = useLogic();
   const {
      wrapper,
      headerBlock,
      pageTitle,
      pageSubtitle,
      skeletonCard,
      skeletonSelector,
      emptyStateBox,
      emptyIconBox,
      emptyTitle,
      emptyDescription,
      iconLg,
   } = useStyle;

   return (
      <div className={wrapper()}>
         <Toaster position="top-right" />

         <div className={headerBlock()}>
            <h1 className={pageTitle()}>Company Overview</h1>
            <p className={pageSubtitle()}>
               Manage your company profile, select active events and interactive games, and monitor live Lucky Draw
               operations.
            </p>
         </div>

         {param.isLoadingInitial ? (
            <>
               <div className={skeletonCard()} />
               <div className={skeletonSelector()} />
            </>
         ) : !param.company ? (
            <div className={emptyStateBox()}>
               <div className={emptyIconBox()}>
                  <Building2 className={iconLg()} />
               </div>
               <h2 className={emptyTitle()}>No Company Profile Found</h2>
               <p className={emptyDescription()}>
                  Your account is not linked to an active company yet, or no companies have been created in the system.
               </p>
            </div>
         ) : (
            <>
               <CompanyInfoCard
                  company={param.company}
                  callerRole={param.caller?.role ?? null}
                  companies={param.companies}
                  onSwitchCompany={func.handleSwitchCompany}
                  onCompanyUpdated={func.refreshCompanyData}
               />

               <EventGameSelector
                  events={param.events}
                  games={param.games}
                  selectedEventId={param.selectedEventId}
                  selectedGameId={param.selectedGameId}
                  isLoadingGames={param.isLoadingGames}
                  onSelectEvent={func.handleSelectEvent}
                  onSelectGame={func.handleSelectGame}
               />

               {param.selectedGame && param.selectedGame.game_type === 'LUCKY_DRAW' ? (
                  <LuckyDrawWorkspace
                     game={param.selectedGame}
                     attendants={param.attendants}
                     staff={param.staff}
                     isLoading={param.isLoadingWorkspace}
                  />
               ) : (
                  <div className={emptyStateBox()}>
                     <div className={emptyIconBox()}>
                        <Gamepad2 className={iconLg()} />
                     </div>
                     <h2 className={emptyTitle()}>
                        {!param.selectedEventId
                           ? 'Select an Event to Get Started'
                           : 'Select a Game to Launch the Workspace'}
                     </h2>
                     <p className={emptyDescription()}>
                        {!param.selectedEventId
                           ? 'Choose one of your company events above to browse its interactive games.'
                           : 'Choose a Lucky Draw game from the right dropdown above to view and filter attendants, assigned staff, and export winner reports.'}
                     </p>
                  </div>
               )}
            </>
         )}
      </div>
   );
};

