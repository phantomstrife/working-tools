{
   /* <div className="xl:col-span-5 bg-white border border-[#ced4da] rounded-xl shadow-sm flex flex-col overflow-hidden">
   <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e5e5e5] bg-[#f5f5f5]/30">
      <div className="flex items-center gap-2.5">
         <h3 className="text-[16px] font-bold text-[#171717]">Assigned Staff</h3>
         <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold bg-[#e5e5e5] text-[#404040]">
            {filteredStaff.length} members
         </span>
      </div>
      <button
         type="button"
         className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#171717] rounded-lg hover:bg-black transition-colors cursor-pointer shadow-sm"
      >
         <Plus className="w-4 h-4" />
         <span className="hidden sm:inline">Assign</span>
      </button>
   </div>

   <div className="px-5 py-4 border-b border-[#e5e5e5]">
      <div className="relative">
         <Search className="w-4 h-4 text-[#a1a1a1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
         <input
            type="text"
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
            placeholder="Search staff..."
            className="w-full pl-10 pr-8 py-2 text-[13px] text-[#171717] bg-[#f5f5f5] border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0036e5] transition-colors"
         />
      </div>
   </div>

   <div className="overflow-x-auto min-h-[250px]">
      <table className="w-full text-left border-collapse whitespace-nowrap">
         <thead className="bg-[#f5f5f5] border-b border-[#ced4da] sticky top-0">
            <tr>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Staff Member</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Role</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252] text-right">
                  Actions
               </th>
            </tr>
         </thead>
         <tbody className="divide-y divide-[#e5e5e5]">
            {filteredStaff.length === 0 ? (
               <tr>
                  <td
                     colSpan="3"
                     className="px-5 py-10 text-center text-[#737373] text-[13px]"
                  >
                     No staff members assigned.
                  </td>
               </tr>
            ) : (
               filteredStaff.map((member) => (
                  <tr
                     key={member.assignmentId}
                     className="hover:bg-[#f5f5f5]/60 transition-colors"
                  >
                     <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                              {member.full_name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-[#171717] flex items-center gap-1.5">
                                 {member.full_name}
                                 {!member.is_active && (
                                    <span
                                       className="w-2 h-2 rounded-full bg-[#e7000b]"
                                       title="Inactive"
                                    />
                                 )}
                              </p>
                              <p className="text-[12px] text-[#737373]">{member.email}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-5 py-4">
                        <span
                           className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase border ${
                              member.role === 'FIELD_STAFF'
                                 ? 'bg-[#ecfeff] text-[#007595] border-[#a2f4fd]'
                                 : 'bg-[#fefce8] text-[#a65f00] border-[#fff085]'
                           }`}
                        >
                           {member.role.replace('_', ' ')}
                        </span>
                     </td>
                     <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                           <button
                              type="button"
                              className="p-1.5 rounded-lg text-[#525252] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
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
</div>; */
}
