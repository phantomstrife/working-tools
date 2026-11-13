'use client';

import { useRef } from 'react';
import { Menu, X, Search, Bell, LogOut } from 'lucide-react';

import defaultAvatar from '@admin-web/assets/svg/default-avatar.svg';

import { navItems } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LayoutAdmin: AdminWeb.Router.Layout = (propeties) => {
   const { children } = propeties;
   const userMenuRef = useRef<HTMLDivElement>(null);

   const { param, func } = useLogic(userMenuRef);
   const { root, mobile, sidebar, fixed_header, main_content } = useStyle;

   return (
      <div className={root.wrapper}>
         <aside className={sidebar.wrapper({ isOpen: param.isSidebarOpen })}>
            <div className={sidebar.header.wrapper}>
               <div className={sidebar.logo.wrapper}>
                  <div className={sidebar.logo.text}>E</div> Event Tools
               </div>
               <button
                  type="button"
                  className={mobile.close_menu}
                  onClick={() => func.setIsSidebarOpen(false)}
               >
                  <X size={20} />
               </button>
            </div>
            <nav className={sidebar.navigation.wrapper}>
               <div className={sidebar.navigation.title}>{func.translate('navigation.title')}</div>
               {navItems.map((item) => {
                  const { wrapper, icon } = sidebar.navigation.items({ active: item.active });

                  return (
                     <a
                        key={item.name}
                        href={item.href}
                        className={wrapper()}
                     >
                        <item.icon className={icon()} />
                        {func.translate(`navigation.items.${item.name}`)}
                     </a>
                  );
               })}
            </nav>
         </aside>

         {param.isSidebarOpen && (
            <div
               className={mobile.overlay}
               onClick={() => func.setIsSidebarOpen(false)}
            />
         )}

         <header className={fixed_header.wrapper}>
            <div className={fixed_header.left}>
               <button
                  type="button"
                  className={mobile.open_menu}
                  onClick={() => func.setIsSidebarOpen(true)}
               >
                  <Menu size={22} />
               </button>
               <div className={fixed_header.search.wrapper}>
                  <Search className={fixed_header.search.icon} />
                  <input
                     type="text"
                     className={fixed_header.search.input}
                     placeholder={func.translate('fixed_header.search_placeholder')}
                  />
               </div>
            </div>

            <div className={fixed_header.tool.wrapper}>
               <button
                  type="button"
                  className={fixed_header.tool.notify_wrapper}
               >
                  <span className={fixed_header.tool.notify_dot} />
                  <Bell size={19} />
               </button>

               <div
                  className={fixed_header.tool.divider}
                  aria-hidden="true"
               />

               <div
                  ref={userMenuRef}
                  className={fixed_header.user.wrapper}
               >
                  <button
                     type="button"
                     onClick={func.handleToggleUserMenu}
                     aria-expanded={param.isUserMenuOpen}
                     aria-haspopup="menu"
                     className={fixed_header.user.trigger({ isOpen: param.isUserMenuOpen })}
                  >
                     <img
                        src={defaultAvatar.src}
                        className={fixed_header.user.avatar}
                        alt="Profile"
                     />
                  </button>

                  {param.isUserMenuOpen && (
                     <div
                        role="menu"
                        className={fixed_header.user.dropdown}
                     >
                        {param.account && (
                           <div className={fixed_header.user.dropdown_header}>
                              <span className={fixed_header.user.dropdown_name}>
                                 {param.account.full_name}
                              </span>
                              <span className={fixed_header.user.dropdown_email}>
                                 {param.account.email}
                              </span>
                              <span className={fixed_header.user.dropdown_role}>
                                 {func.translate(`roles.${param.account.role}`)}
                              </span>
                           </div>
                        )}
                        <div className={fixed_header.user.dropdown_body}>
                           <button
                              type="button"
                              role="menuitem"
                              onClick={func.handleLogout}
                              disabled={param.isLoggingOut}
                              className={fixed_header.user.logout_button({ loading: param.isLoggingOut })}
                           >
                              <LogOut className={fixed_header.user.logout_icon} />
                              {func.translate(param.isLoggingOut ? 'logout.loading' : 'logout.label')}
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </header>

         <main
            className={main_content.wrapper}
            role="main"
         >
            {children}
         </main>
      </div>
   );
};
