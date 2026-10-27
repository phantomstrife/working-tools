import { Calendar, Gamepad2, LogOut, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Outlet } from 'react-router';

import { ROUTE } from '@client-app/routes/constants';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LayoutVenue: ClientApp.Router.Layout = () => {
   const { param, func } = useLogic();
   const { root, header } = useStyle;

   return (
      <div className={root.wrapper}>
         <header className={header.wrapper}>
            <div className={header.brand.wrapper}>
               <div className={header.brand.logo}>
                  <ShieldCheck size={18} />
               </div>
               <div className={header.brand.title_group}>
                  <span className={header.brand.title}>{func.translate('app_title')}</span>
                  {param.account && (
                     <span className={header.brand.subtitle}>{func.translate(`roles.${param.account.role}`)}</span>
                  )}
               </div>
            </div>

            {param.isSuperAdmin && (
               <div className={header.modes.wrapper}>
                  <button
                     type="button"
                     className={header.modes.button({
                        active: param.currentPath.startsWith(ROUTE.GUARD.HOME),
                     })}
                     onClick={() => func.handleNavigateMode(ROUTE.GUARD.HOME)}
                  >
                     <ShieldCheck size={14} />
                     {func.translate('modes.guard')}
                  </button>
                  <button
                     type="button"
                     className={header.modes.button({
                        active: param.currentPath.startsWith(ROUTE.OPERATOR.HOME),
                     })}
                     onClick={() => func.handleNavigateMode(ROUTE.OPERATOR.HOME)}
                  >
                     <Sparkles size={14} />
                     {func.translate('modes.operator')}
                  </button>
               </div>
            )}

            <div className={header.selector.wrapper}>
               <div className={header.selector.field}>
                  <Calendar className={header.selector.icon} />
                  <span className={header.selector.label}>{func.translate('event_label')}:</span>
                  <select
                     value={param.selectedEventId}
                     disabled={param.isLoadingAssignments || param.events.length === 0}
                     onChange={func.handleEventChange}
                     className={header.selector.select}
                  >
                     {param.events.length === 0 ? (
                        <option value="">{func.translate('no_events')}</option>
                     ) : (
                        param.events.map((event) => (
                           <option
                              key={event.id}
                              value={event.id}
                           >
                              {event.name}
                           </option>
                        ))
                     )}
                  </select>
               </div>

               <div className={header.selector.field}>
                  <Gamepad2 className={header.selector.icon} />
                  <span className={header.selector.label}>{func.translate('game_label')}:</span>
                  <select
                     value={param.selectedGameId}
                     disabled={param.isLoadingAssignments || param.games.length === 0}
                     onChange={func.handleGameChange}
                     className={header.selector.select}
                  >
                     {param.games.length === 0 ? (
                        <option value="">{func.translate('no_games')}</option>
                     ) : (
                        param.games.map((game) => (
                           <option
                              key={game.id}
                              value={game.id}
                           >
                              {game.name}
                           </option>
                        ))
                     )}
                  </select>
                  {param.selectedGame && (
                     <span className={header.selector.status({ status: param.selectedGame.status })}>
                        {func.translate(`game_status.${param.selectedGame.status}`)}
                     </span>
                  )}
               </div>

               <button
                  type="button"
                  title={func.translate('refresh_assignments')}
                  disabled={param.isLoadingAssignments}
                  onClick={func.fetchAssignments}
                  className={header.selector.refresh_button}
               >
                  <RefreshCw className={header.selector.refresh_icon({ loading: param.isLoadingAssignments })} />
               </button>
            </div>

            {param.account && (
               <div className={header.user.wrapper}>
                  <div className={header.user.info}>
                     <div className={header.user.name_row}>
                        <span className={header.user.name}>{param.account.full_name}</span>
                        <span className={header.user.role_badge({ role: param.account.role })}>
                           {func.translate(`roles.${param.account.role}`)}
                        </span>
                     </div>
                     <span className={header.user.email}>{param.account.email}</span>
                  </div>
                  <button
                     type="button"
                     onClick={func.handleLogout}
                     className={header.user.logout_button}
                  >
                     <LogOut className={header.user.logout_icon} />
                     {func.translate('logout')}
                  </button>
               </div>
            )}
         </header>

         <main className={root.main}>
            <Outlet />
         </main>
      </div>
   );
};
