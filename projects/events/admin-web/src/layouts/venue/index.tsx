'use client';

import { useRef } from 'react';
import {
   LayoutDashboard,
   LogOut,
   ShieldCheck,
   Sparkles,
} from 'lucide-react';

import defaultAvatar from '@admin-web/assets/svg/default-avatar.svg';
import { ROUTE } from '@admin-web/routes/constants';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LayoutVenue: AdminWeb.Router.Layout = (properties) => {
   const { children } = properties;
   const userMenuRef = useRef<HTMLDivElement>(null);

   const { param, func } = useLogic(userMenuRef);
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
                     <span className={header.brand.subtitle}>
                        {func.translate(`roles.${param.account.role}`)}
                     </span>
                  )}
               </div>
            </div>

            <div className={header.right}>
               {param.canSwitchModes && (
                  <div className={header.modes.wrapper}>
                     {param.dashboardPath && (
                        <button
                           type="button"
                           className={header.modes.button({ active: false })}
                           onClick={() => func.handleNavigateMode(param.dashboardPath)}
                        >
                           <LayoutDashboard size={14} />
                           {func.translate('modes.dashboard')}
                        </button>
                     )}
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

               {param.account && (
                  <div
                     ref={userMenuRef}
                     className={header.user.wrapper}
                  >
                     <button
                        type="button"
                        onClick={func.handleToggleUserMenu}
                        aria-expanded={param.isUserMenuOpen}
                        aria-haspopup="menu"
                        className={header.user.trigger({ isOpen: param.isUserMenuOpen })}
                     >
                        <img
                           src={defaultAvatar.src}
                           className={header.user.avatar}
                           alt="Profile"
                        />
                     </button>

                     {param.isUserMenuOpen && (
                        <div
                           role="menu"
                           className={header.user.dropdown}
                        >
                           <div className={header.user.dropdown_header}>
                              <span className={header.user.dropdown_name}>
                                 {param.account.full_name}
                              </span>
                              <span className={header.user.dropdown_email}>
                                 {param.account.email}
                              </span>
                              <span className={header.user.dropdown_role({ role: param.account.role })}>
                                 {func.translate(`roles.${param.account.role}`)}
                              </span>
                           </div>

                           {param.canSwitchModes && (
                              <div className={header.user.dropdown_modes}>
                                 {param.dashboardPath && (
                                    <button
                                       type="button"
                                       role="menuitem"
                                       className={header.user.dropdown_mode_btn({ active: false })}
                                       onClick={() => func.handleNavigateMode(param.dashboardPath)}
                                    >
                                       <LayoutDashboard size={15} />
                                       {func.translate('modes.dashboard')}
                                    </button>
                                 )}
                                 <button
                                    type="button"
                                    role="menuitem"
                                    className={header.user.dropdown_mode_btn({
                                       active: param.currentPath.startsWith(ROUTE.GUARD.HOME),
                                    })}
                                    onClick={() => func.handleNavigateMode(ROUTE.GUARD.HOME)}
                                 >
                                    <ShieldCheck size={15} />
                                    {func.translate('modes.guard')}
                                 </button>
                                 <button
                                    type="button"
                                    role="menuitem"
                                    className={header.user.dropdown_mode_btn({
                                       active: param.currentPath.startsWith(ROUTE.OPERATOR.HOME),
                                    })}
                                    onClick={() => func.handleNavigateMode(ROUTE.OPERATOR.HOME)}
                                 >
                                    <Sparkles size={15} />
                                    {func.translate('modes.operator')}
                                 </button>
                              </div>
                           )}

                           <div className={header.user.dropdown_body}>
                              <button
                                 type="button"
                                 role="menuitem"
                                 onClick={func.handleLogout}
                                 className={header.user.logout_button}
                              >
                                 <LogOut className={header.user.logout_icon} />
                                 {func.translate('logout')}
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </header>

         <main className={root.main}>{children}</main>
      </div>
   );
};

