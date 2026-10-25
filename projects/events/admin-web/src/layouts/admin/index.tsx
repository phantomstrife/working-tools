'use client';

import Image from 'next/image';
import { Menu, X, Search, Bell } from 'lucide-react';

import defaultAvatar from '@admin-web/assets/svg/default-avatar.svg';

import { navItems } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const LayoutAdmin: Router.Layout = (propeties) => {
   const { children } = propeties;

   const { param, func } = useLogic();
   const { root, mobile, sidebar, fixed_header, main_content } = useStyle;

   return (
      <div className={root.wrapper}>
         <aside className={sidebar.wrapper({ isOpen: param.isSidebarOpen })}>
            <div className={sidebar.header.wrapper}>
               <div className={sidebar.logo.wrapper}>
                  <div className={sidebar.logo.text}>E</div> Event Tools
               </div>
               <button
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
            <button
               className={mobile.open_menu}
               onClick={() => func.setIsSidebarOpen(true)}
            >
               <Menu size={28} />
            </button>
            <div className={fixed_header.search.wrapper}>
               <Search className={fixed_header.search.icon} />
               <input
                  type="text"
                  className={fixed_header.search.input}
                  placeholder={func.translate('fixed_header.search_placeholder')}
               />
            </div>
            <div className={fixed_header.tool.wrapper}>
               <button className={fixed_header.tool.notify_wrapper}>
                  <span className={fixed_header.tool.notify_dot} />
                  <Bell size={20} />
               </button>
               <div
                  className={fixed_header.tool.divider}
                  aria-hidden="true"
               />
               <button className={fixed_header.tool.account_wrapper}>
                  <Image
                     src={defaultAvatar}
                     className={fixed_header.tool.account_image}
                     alt="Profile"
                  />
               </button>
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
