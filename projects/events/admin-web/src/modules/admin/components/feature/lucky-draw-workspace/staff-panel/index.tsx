'use client';

import { Search, X } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { StaffPanelProps } from './use-logic';

export const StaffPanel = (props: StaffPanelProps) => {
   const { param, func } = useLogic(props);
   const {
      panel,
      header,
      titleGroup,
      title,
      countPill,
      toolbar,
      searchBox,
      searchIcon,
      searchInput,
      clearSearchBtn,
      tableScroll,
      table,
      thead,
      th,
      tbody,
      tr,
      td,
      nameText,
      roleBadge,
      activeBadge,
      emptyState,
      skeletonRow,
      iconSm,
   } = useStyle;

   return (
      <div className={panel()}>
         <div className={header()}>
            <div className={titleGroup()}>
               <h3 className={title()}>Staff</h3>
               <span className={countPill()}>
                  {param.filteredStaff.length} / {param.totalCount}
               </span>
            </div>
         </div>

         <div className={toolbar()}>
            <div className={searchBox()}>
               <Search className={searchIcon()} />
               <input
                  type="text"
                  value={param.searchQuery}
                  onChange={func.handleSearchChange}
                  placeholder="Search by name, phone, or email..."
                  className={searchInput()}
               />
               {param.searchQuery && (
                  <button
                     type="button"
                     aria-label="Clear search"
                     onClick={func.handleClearSearch}
                     className={clearSearchBtn()}
                  >
                     <X className={iconSm()} />
                  </button>
               )}
            </div>
         </div>

         <div className={tableScroll()}>
            <table className={table()}>
               <thead className={thead()}>
                  <tr>
                     <th className={th()}>Full Name</th>
                     <th className={th()}>Email</th>
                     <th className={th()}>Phone</th>
                     <th className={th()}>Role</th>
                     <th className={th()}>Status</th>
                  </tr>
               </thead>
               <tbody className={tbody()}>
                  {param.isLoading ? (
                     Array.from({ length: 5 }).map((_, rowIdx) => (
                        <tr
                           key={rowIdx}
                           className={tr()}
                        >
                           {Array.from({ length: 5 }).map((__, colIdx) => (
                              <td
                                 key={colIdx}
                                 className={td()}
                              >
                                 <div className={skeletonRow()} />
                              </td>
                           ))}
                        </tr>
                     ))
                  ) : param.filteredStaff.length === 0 ? (
                     <tr>
                        <td
                           colSpan={5}
                           className={emptyState()}
                        >
                           {param.totalCount === 0
                              ? 'No staff members assigned to this game yet.'
                              : 'No assigned staff match your search query.'}
                        </td>
                     </tr>
                  ) : (
                     param.filteredStaff.map((member) => {
                        const isActive = member.is_active !== false;
                        return (
                           <tr
                              key={member.assignmentId}
                              className={tr()}
                           >
                              <td className={td()}>
                                 <span className={nameText()}>{member.full_name}</span>
                              </td>
                              <td className={td()}>{member.email}</td>
                              <td className={td()}>{member.phone || '—'}</td>
                              <td className={td()}>
                                 <span className={roleBadge({ role: member.role })}>{member.role}</span>
                              </td>
                              <td className={td()}>
                                 <span className={activeBadge({ active: isActive })}>
                                    {isActive ? 'Active' : 'Inactive'}
                                 </span>
                              </td>
                           </tr>
                        );
                     })
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
};

