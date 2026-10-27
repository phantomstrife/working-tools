'use client';

import { ChevronLeft, ChevronRight, Download, Mail, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';
import type * as Types from './type';

export const AttendantsPanel: Component<Types.Properties> = (properties) => {
   const { onImportCsv, onSendEmails, onExportWinners, onCreate, onEdit, onDelete } = properties;
   const { param, func } = useLogic(properties);
   const { root, header, toolbar, table, pagination } = useStyle;

   return (
      <div className={root.wrapper}>
         <div className={header.wrapper}>
            <div className={header.title.wrapper}>
               <h3 className={header.title.text}>{func.translate('title')}</h3>
               <span className={header.title.badge}>
                  {param.filteredAttendants.length} {func.translate('records_unit')}
               </span>
            </div>
            <div className={header.action.wrapper}>
               <button
                  type="button"
                  onClick={onImportCsv}
                  className={header.action.secondary_button}
               >
                  <Upload className={header.action.icon} />
                  <span className={header.action.label_responsive}>{func.translate('actions.import_csv')}</span>
               </button>
               <button
                  type="button"
                  onClick={onSendEmails}
                  className={header.action.secondary_button}
               >
                  <Mail className={header.action.icon} />
                  <span className={header.action.label_responsive}>{func.translate('actions.send_emails')}</span>
               </button>
               <button
                  type="button"
                  onClick={onExportWinners}
                  className={header.action.secondary_button}
               >
                  <Download className={header.action.icon} />
                  <span className={header.action.label_responsive}>{func.translate('actions.export_winners')}</span>
               </button>
               <button
                  type="button"
                  onClick={onCreate}
                  className={header.action.primary_button}
               >
                  <Plus className={header.action.icon} />
                  <span>{func.translate('actions.create')}</span>
               </button>
            </div>
         </div>
         <div className={toolbar.wrapper}>
            <div className={toolbar.search.wrapper}>
               <Search className={toolbar.search.icon} />
               <input
                  type="text"
                  value={param.attSearch}
                  onChange={func.handleSearchChange}
                  placeholder={func.translate('toolbar.search_placeholder')}
                  className={toolbar.search.input}
               />
               {param.attSearch && (
                  <button
                     type="button"
                     onClick={func.handleClearSearch}
                     className={toolbar.search.clear_button}
                  >
                     <X className={toolbar.search.clear_icon} />
                  </button>
               )}
            </div>
            <select
               value={param.attFilter}
               onChange={func.handleFilterChange}
               className={toolbar.filter_select}
            >
               <option value="ALL">{func.translate('toolbar.filters.all')}</option>
               <optgroup label={func.translate('toolbar.filters.checkin_group')}>
                  <option value="CHECKED_IN">{func.translate('toolbar.filters.checked_in')}</option>
                  <option value="NOT_CHECKED_IN">{func.translate('toolbar.filters.not_checked_in')}</option>
               </optgroup>
               <optgroup label={func.translate('toolbar.filters.winner_group')}>
                  <option value="WINNER">{func.translate('toolbar.filters.winner')}</option>
                  <option value="NOT_WINNER">{func.translate('toolbar.filters.not_winner')}</option>
               </optgroup>
            </select>
         </div>
         <div className={table.scroll_wrapper}>
            <table className={table.wrapper}>
               <thead className={table.head.wrapper}>
                  <tr>
                     <th className={table.head.th}>{func.translate('table.headers.full_name')}</th>
                     <th className={table.head.th}>{func.translate('table.headers.phone')}</th>
                     <th className={table.head.th}>{func.translate('table.headers.email')}</th>
                     <th className={table.head.th}>{func.translate('table.headers.ticket_code')}</th>
                     <th className={table.head.th}>{func.translate('table.headers.checked_in')}</th>
                     <th className={table.head.th}>{func.translate('table.headers.has_won')}</th>
                     <th className={table.head.th_right}>{func.translate('table.headers.actions')}</th>
                  </tr>
               </thead>
               <tbody className={table.body.wrapper}>
                  {param.filteredAttendants.length === 0 ? (
                     <tr>
                        <td
                           colSpan={7}
                           className={table.body.empty_state}
                        >
                           {func.translate('table.empty_state')}
                        </td>
                     </tr>
                  ) : (
                     param.filteredAttendants.map((item) => (
                        <tr
                           key={item.id}
                           className={table.body.tr}
                        >
                           <td className={table.body.td_name}>{item.full_name}</td>
                           <td className={table.body.td_text}>{item.phone || '—'}</td>
                           <td className={table.body.td_text}>{item.email || '—'}</td>
                           <td className={table.body.td}>
                              <span className={table.cell.ticket_badge}>{item.ticket_code}</span>
                           </td>
                           <td className={table.body.td}>
                              <span
                                 className={table.cell.status_badge({
                                    variant: item.is_checked_in ? 'checkedIn' : 'notCheckedIn',
                                 })}
                              >
                                 {item.is_checked_in
                                    ? func.translate('table.badges.checked_in')
                                    : func.translate('table.badges.pending')}
                              </span>
                           </td>
                           <td className={table.body.td}>
                              <span
                                 className={table.cell.status_badge({
                                    variant: item.has_won ? 'winner' : 'notWinner',
                                 })}
                              >
                                 {item.has_won
                                    ? func.translate('table.badges.winner')
                                    : func.translate('table.badges.no')}
                              </span>
                           </td>
                           <td className={table.body.td_right}>
                              <div className={table.action.wrapper}>
                                 <button
                                    type="button"
                                    onClick={() => onEdit?.(item)}
                                    className={table.action.button({ danger: false })}
                                 >
                                    <Pencil className={table.action.icon} />
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => onDelete?.(item)}
                                    className={table.action.button({ danger: true })}
                                 >
                                    <Trash2 className={table.action.icon} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
         <div className={pagination.wrapper}>
            <span className={pagination.summary}>
               {func.translate('pagination.showing')} 1 {func.translate('pagination.to')}{' '}
               {param.filteredAttendants.length} {func.translate('pagination.of')} {param.attendants.length}{' '}
               {func.translate('records_unit')}
            </span>
            <div className={pagination.control.wrapper}>
               <select
                  value={param.pageSize}
                  onChange={func.handleLimitChange}
                  className={pagination.control.limit_select}
               >
                  {param.pageSizeOptions.map((size) => (
                     <option
                        key={size}
                        value={size}
                     >
                        {size} / {func.translate('pagination.per_page')}
                     </option>
                  ))}
               </select>
               <div className={pagination.control.nav_wrapper}>
                  <button
                     type="button"
                     className={pagination.control.page_button({ disabled: true })}
                  >
                     <ChevronLeft className={pagination.control.icon} />
                  </button>
                  <span className={pagination.control.page_indicator}>
                     {func.translate('pagination.page')} 1 {func.translate('pagination.of')} 1
                  </span>
                  <button
                     type="button"
                     className={pagination.control.page_button({ disabled: true })}
                  >
                     <ChevronRight className={pagination.control.icon} />
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

{
   /* <div className="bg-white border border-[#ced4da] rounded-xl shadow-sm flex flex-col overflow-hidden">
   <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-[#e5e5e5] bg-[#f5f5f5]/30">
      <div className="flex items-center gap-2.5">
         <h3 className="text-[16px] font-bold text-[#171717]">Attendant Management</h3>
         <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold bg-[#e5e5e5] text-[#404040]">
            {filteredAttendants.length} records
         </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
         <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#262626] bg-white border border-[#ced4da] rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer shadow-sm"
         >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import CSV</span>
         </button>
         <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#262626] bg-white border border-[#ced4da] rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer shadow-sm"
         >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Send Emails</span>
         </button>
         <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[#262626] bg-white border border-[#ced4da] rounded-lg hover:bg-[#f5f5f5] transition-colors cursor-pointer shadow-sm"
         >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Winners</span>
         </button>
         <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-white bg-[#171717] rounded-lg hover:bg-black transition-colors cursor-pointer shadow-sm"
         >
            <Plus className="w-4 h-4" />
            <span>Create</span>
         </button>
      </div>
   </div>

   <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 bg-white border-b border-[#e5e5e5]">
      <div className="relative flex-1 min-w-0">
         <Search className="w-4 h-4 text-[#a1a1a1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
         <input
            type="text"
            value={attSearch}
            onChange={(e) => setAttSearch(e.target.value)}
            placeholder="Search by name, phone, email, or ticket..."
            className="w-full pl-10 pr-8 py-2 text-[13px] text-[#171717] bg-[#f5f5f5] border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0036e5] focus:bg-white focus:ring-2 focus:ring-[#0036e5]/20 transition-all"
         />
         {attSearch && (
            <button
               type="button"
               onClick={() => setAttSearch('')}
               className="p-1 text-[#a1a1a1] hover:text-[#404040] absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
               <X className="w-4 h-4" />
            </button>
         )}
      </div>

      <select
         value={attFilter}
         onChange={(e) => setAttFilter(e.target.value)}
         className="px-3.5 py-2 text-[13px] font-medium text-[#262626] bg-[#f5f5f5] border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0036e5] hover:border-[#a1a1a1] cursor-pointer transition-colors sm:w-48"
      >
         <option value="ALL">All Attendants</option>
         <optgroup label="Check-In Status">
            <option value="CHECKED_IN">Checked In</option>
            <option value="NOT_CHECKED_IN">Not Checked In</option>
         </optgroup>
         <optgroup label="Winner Status">
            <option value="WINNER">Has Won</option>
            <option value="NOT_WINNER">Not Won</option>
         </optgroup>
      </select>
   </div>

   <div className="overflow-x-auto min-h-[300px]">
      <table className="w-full text-left border-collapse whitespace-nowrap">
         <thead className="bg-[#f5f5f5] border-b border-[#ced4da] sticky top-0">
            <tr>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Full Name</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Phone</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Email</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Ticket Code</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Checked In</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Has Won</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252] text-right">
                  Actions
               </th>
            </tr>
         </thead>
         <tbody className="divide-y divide-[#e5e5e5]">
            {filteredAttendants.length === 0 ? (
               <tr>
                  <td
                     colSpan="7"
                     className="px-5 py-12 text-center text-[#737373] text-[14px]"
                  >
                     No attendants match your current filters.
                  </td>
               </tr>
            ) : (
               filteredAttendants.map((item) => (
                  <tr
                     key={item.id}
                     className="hover:bg-[#f5f5f5]/60 transition-colors"
                  >
                     <td className="px-5 py-3 text-[14px] font-semibold text-[#171717]">{item.full_name}</td>
                     <td className="px-5 py-3 text-[13px] text-[#525252]">{item.phone || '—'}</td>
                     <td className="px-5 py-3 text-[13px] text-[#525252]">{item.email || '—'}</td>
                     <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-[#d4d4d4] bg-[#f5f5f5] text-[12px] font-mono font-medium text-[#262626]">
                           {item.ticket_code}
                        </span>
                     </td>
                     <td className="px-5 py-3">
                        <span
                           className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                              item.is_checked_in
                                 ? 'bg-[#f0fdf4] text-[#008236] border-[#b9f8cf]'
                                 : 'bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]'
                           }`}
                        >
                           {item.is_checked_in ? 'Checked In' : 'Pending'}
                        </span>
                     </td>
                     <td className="px-5 py-3">
                        <span
                           className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                              item.has_won
                                 ? 'bg-[#fefce8] text-[#a65f00] border-[#fff085]'
                                 : 'bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]'
                           }`}
                        >
                           {item.has_won ? 'Winner' : 'No'}
                        </span>
                     </td>
                     <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                           <button
                              type="button"
                              className="p-1.5 rounded-lg text-[#525252] hover:text-[#171717] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
                           >
                              <Pencil className="w-4 h-4" />
                           </button>
                           <button
                              type="button"
                              className="p-1.5 rounded-lg text-[#e7000b] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))
            )}
         </tbody>
      </table>
   </div>
   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 bg-[#f5f5f5]/60 border-t border-[#ced4da]">
      <span className="text-[13px] text-[#737373]">
         Showing 1 to {filteredAttendants.length} of {attendants.length} records
      </span>
      <div className="flex items-center gap-3 mt-3 sm:mt-0">
         <select className="appearance-none bg-white border border-[#ced4da] rounded-lg px-3 py-1.5 text-[12px] font-medium focus:outline-none cursor-pointer">
            <option>10 / page</option>
            <option>20 / page</option>
            <option>50 / page</option>
         </select>
         <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-[#ced4da] bg-white text-[#a1a1a1] cursor-not-allowed">
               <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] font-semibold text-[#262626] px-2">Page 1 of 1</span>
            <button className="p-1.5 rounded-lg border border-[#ced4da] bg-white text-[#a1a1a1] cursor-not-allowed">
               <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>
   </div>
</div>; */
}
