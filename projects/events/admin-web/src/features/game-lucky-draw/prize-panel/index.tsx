{
   /* <div className="xl:col-span-7 bg-white border border-[#ced4da] rounded-xl shadow-sm flex flex-col overflow-hidden">
   <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#e5e5e5] bg-[#f5f5f5]/30">
      <div className="flex items-center gap-2.5">
         <h3 className="text-[16px] font-bold text-[#171717]">Prize Configuration</h3>
         <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-semibold bg-[#e5e5e5] text-[#404040]">
            {filteredPrizes.length} / {prizes.length}
         </span>
      </div>
      <button
         type="button"
         className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#171717] rounded-lg hover:bg-black transition-colors cursor-pointer shadow-sm"
      >
         <Plus className="w-4 h-4" />
         <span>Create Prize</span>
      </button>
   </div>

   <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-[#e5e5e5]">
      <div className="relative flex-1 min-w-0">
         <Search className="w-4 h-4 text-[#a1a1a1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
         <input
            type="text"
            value={prizeSearch}
            onChange={(e) => setPrizeSearch(e.target.value)}
            placeholder="Search prizes..."
            className="w-full pl-10 pr-8 py-2 text-[13px] text-[#171717] bg-[#f5f5f5] border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0036e5] transition-colors"
         />
      </div>
      <select
         value={prizeStockFilter}
         onChange={(e) => setPrizeStockFilter(e.target.value)}
         className="px-3.5 py-2 text-[13px] font-medium text-[#262626] bg-[#f5f5f5] border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#0036e5] cursor-pointer sm:w-40"
      >
         <option value="ALL">All Stock</option>
         <option value="IN_STOCK">In Stock</option>
         <option value="DEPLETED">Depleted</option>
      </select>
   </div>

   <div className="overflow-x-auto min-h-[250px]">
      <table className="w-full text-left border-collapse whitespace-nowrap">
         <thead className="bg-[#f5f5f5] border-b border-[#ced4da] sticky top-0">
            <tr>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Tier</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Prize</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Stock</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252]">Status</th>
               <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#525252] text-right">
                  Actions
               </th>
            </tr>
         </thead>
         <tbody className="divide-y divide-[#e5e5e5]">
            {filteredPrizes.length === 0 ? (
               <tr>
                  <td
                     colSpan="5"
                     className="px-5 py-10 text-center text-[#737373] text-[13px]"
                  >
                     No prizes match your filter.
                  </td>
               </tr>
            ) : (
               filteredPrizes.map((item) => {
                  const state =
                     item.remaining_quantity === 0
                        ? 'DEPLETED'
                        : item.remaining_quantity <= Math.ceil(item.total_quantity * 0.35)
                          ? 'LOW_STOCK'
                          : 'IN_STOCK';
                  return (
                     <tr
                        key={item.id}
                        className="hover:bg-[#f5f5f5]/60 transition-colors"
                     >
                        <td className="px-5 py-4">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[12px] font-bold uppercase border bg-[#e5ebff] text-[#001f84] border-[#658aff]">
                              Tier #{item.tier_order}
                           </span>
                        </td>
                        <td className="px-5 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg border border-[#ced4da] bg-[#f5f5f5] flex items-center justify-center shrink-0 text-[#737373] shadow-sm">
                                 <Gift className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[14px] font-bold text-[#171717] truncate max-w-[200px]">
                                    {item.name}
                                 </p>
                                 <p className="text-[12px] text-[#737373] truncate max-w-[200px]">{item.description}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-5 py-4">
                           <div className="flex flex-col gap-1">
                              <span className="text-[13px] font-bold text-[#171717]">
                                 {item.remaining_quantity}{' '}
                                 <span className="text-[#a1a1a1] font-medium">/ {item.total_quantity}</span>
                              </span>
                              <div className="w-16 h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                                 <div
                                    className={`h-full rounded-full ${state === 'DEPLETED' ? 'bg-[#e7000b]' : state === 'LOW_STOCK' ? 'bg-[#f0b100]' : 'bg-[#00c950]'}`}
                                    style={{ width: `${(item.remaining_quantity / item.total_quantity) * 100}%` }}
                                 />
                              </div>
                           </div>
                        </td>
                        <td className="px-5 py-4">
                           <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                                 state === 'IN_STOCK'
                                    ? 'bg-[#f0fdf4] text-[#008236] border-[#b9f8cf]'
                                    : state === 'LOW_STOCK'
                                      ? 'bg-[#fefce8] text-[#a65f00] border-[#fff085]'
                                      : 'bg-[#fef2f2] text-[#c10007] border-[#ffc9c9]'
                              }`}
                           >
                              {state === 'IN_STOCK' ? 'In Stock' : state === 'LOW_STOCK' ? 'Low Stock' : 'Depleted'}
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
                  );
               })
            )}
         </tbody>
      </table>
   </div>
</div>; */
}
