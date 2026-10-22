import { ArrowUpDown, Search, X } from 'lucide-react';

import { useStyle } from './use-style';

import type { SearchToolbarProps } from './type';

export function SearchToolbar({
   searchValue,
   searchPlaceholder = 'Search records...',
   onSearchChange,
   onClearSearch,
   filters = [],
   sortBy,
   sortOptions,
   sortOrder,
   onSortFieldChange,
   onToggleSortOrder,
   activeChips = [],
   onClearAllFilters,
}: SearchToolbarProps) {
   const {
      wrapper,
      controlsRow,
      searchBox,
      searchIcon,
      searchInput,
      clearSearchBtn,
      filterGroup,
      select,
      sortOrderBtn,
      chipsRow,
      chip,
      chipRemoveBtn,
      clearAllBtn,
      iconXs,
   } = useStyle;

   return (
      <section className={wrapper()}>
         <div className={controlsRow()}>
            <div className={searchBox()}>
               <Search className={searchIcon()} />
               <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={searchInput()}
               />
               {searchValue && (
                  <button
                     type="button"
                     onClick={onClearSearch}
                     className={clearSearchBtn()}
                     aria-label="Clear search"
                  >
                     <X className={iconXs()} />
                  </button>
               )}
            </div>

            <div className={filterGroup()}>
               {filters.map((filter) => (
                  <select
                     key={filter.key}
                     value={filter.value}
                     onChange={(e) => filter.onChange(e.target.value)}
                     className={select()}
                     aria-label={filter.ariaLabel}
                  >
                     {filter.options.map((opt) => (
                        <option
                           key={opt.value}
                           value={opt.value}
                        >
                           {opt.label}
                        </option>
                     ))}
                  </select>
               ))}

               <select
                  value={sortBy}
                  onChange={(e) => onSortFieldChange(e.target.value)}
                  className={select()}
                  aria-label="Sort field"
               >
                  {sortOptions.map((opt) => (
                     <option
                        key={opt.value}
                        value={opt.value}
                     >
                        {opt.label}
                     </option>
                  ))}
               </select>

               <button
                  type="button"
                  onClick={onToggleSortOrder}
                  className={sortOrderBtn()}
               >
                  <ArrowUpDown className={iconXs()} />
                  {sortOrder === 'asc' ? 'ASC' : 'DESC'}
               </button>
            </div>
         </div>

         {activeChips.length > 0 && (
            <div className={chipsRow()}>
               {activeChips.map((item) => (
                  <span
                     key={item.key}
                     className={chip()}
                  >
                     {item.label}
                     <button
                        type="button"
                        onClick={item.onRemove}
                        className={chipRemoveBtn()}
                        aria-label={`Remove ${item.label}`}
                     >
                        <X className={iconXs()} />
                     </button>
                  </span>
               ))}

               {onClearAllFilters && (
                  <button
                     type="button"
                     onClick={onClearAllFilters}
                     className={clearAllBtn()}
                  >
                     Clear all
                  </button>
               )}
            </div>
         )}
      </section>
   );
}

