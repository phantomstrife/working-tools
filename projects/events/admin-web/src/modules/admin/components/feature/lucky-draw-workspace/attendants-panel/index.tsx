'use client';

import { Download, Search, X } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { AttendantsPanelProps } from './use-logic';

export const AttendantsPanel = (props: AttendantsPanelProps) => {
   const { param, func } = useLogic(props);
   const {
      panel,
      header,
      titleGroup,
      title,
      countPill,
      exportBtn,
      toolbar,
      searchBox,
      searchIcon,
      searchInput,
      clearSearchBtn,
      filterSelect,
      tableScroll,
      table,
      thead,
      th,
      tbody,
      tr,
      td,
      nameText,
      ticketBadge,
      boolBadge,
      emptyState,
      skeletonRow,
      iconSm,
   } = useStyle;

   const isExportDisabled = param.isLoading || param.isExporting;

   return (
      <div className={panel()}>
         <div className={header()}>
            <div className={titleGroup()}>
               <h3 className={title()}>Attendants</h3>
               <span className={countPill()}>
                  {param.filteredAttendants.length} / {param.totalCount}
               </span>
            </div>

            <button
               type="button"
               disabled={isExportDisabled}
               onClick={func.handleExportWinnerCsv}
               className={exportBtn({ disabled: isExportDisabled })}
            >
               <Download className={iconSm()} />
               <span>{param.isExporting ? 'Exporting...' : 'Export CSV Winner'}</span>
            </button>
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

            <select
               aria-label="Filter attendants"
               value={param.filterValue}
               onChange={func.handleFilterChange}
               className={filterSelect()}
            >
               <option value="ALL">Filter: All Attendants</option>
               <optgroup label="Check-In Status">
                  <option value="CHECKED_IN">Check-In: Checked In</option>
                  <option value="NOT_CHECKED_IN">Check-In: Not Checked In</option>
               </optgroup>
               <optgroup label="Winner Status">
                  <option value="WINNER">Winner: Has Won</option>
                  <option value="NOT_WINNER">Winner: Not Won</option>
               </optgroup>
               <optgroup label="Email Status">
                  <option value="EMAIL_SENT">Email: Sent</option>
                  <option value="EMAIL_NOT_SENT">Email: Not Sent</option>
                  <option value="EMAIL_FAILED">Email: Failed</option>
               </optgroup>
            </select>
         </div>

         <div className={tableScroll()}>
            <table className={table()}>
               <thead className={thead()}>
                  <tr>
                     <th className={th()}>Full Name</th>
                     <th className={th()}>Phone</th>
                     <th className={th()}>Email</th>
                     <th className={th()}>Ticket Code</th>
                     <th className={th()}>Checked In</th>
                     <th className={th()}>Has Won</th>
                  </tr>
               </thead>
               <tbody className={tbody()}>
                  {param.isLoading ? (
                     Array.from({ length: 5 }).map((_, rowIdx) => (
                        <tr
                           key={rowIdx}
                           className={tr()}
                        >
                           {Array.from({ length: 6 }).map((__, colIdx) => (
                              <td
                                 key={colIdx}
                                 className={td()}
                              >
                                 <div className={skeletonRow()} />
                              </td>
                           ))}
                        </tr>
                     ))
                  ) : param.filteredAttendants.length === 0 ? (
                     <tr>
                        <td
                           colSpan={6}
                           className={emptyState()}
                        >
                           {param.totalCount === 0
                              ? 'No attendants registered for this Lucky Draw game yet.'
                              : 'No attendants match your search or filter criteria.'}
                        </td>
                     </tr>
                  ) : (
                     param.filteredAttendants.map((item) => (
                        <tr
                           key={item.id}
                           className={tr()}
                        >
                           <td className={td()}>
                              <span className={nameText()}>{item.full_name}</span>
                           </td>
                           <td className={td()}>{item.phone || '—'}</td>
                           <td className={td()}>{item.email || '—'}</td>
                           <td className={td()}>
                              <span className={ticketBadge()}>{item.ticket_code}</span>
                           </td>
                           <td className={td()}>
                              <span
                                 className={boolBadge({
                                    variant: item.is_checked_in ? 'checkedIn' : 'notCheckedIn',
                                 })}
                              >
                                 {item.is_checked_in ? 'Checked In' : 'Pending'}
                              </span>
                           </td>
                           <td className={td()}>
                              <span
                                 className={boolBadge({
                                    variant: item.has_won ? 'winner' : 'notWinner',
                                 })}
                              >
                                 {item.has_won ? 'Winner' : 'No'}
                              </span>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
};

