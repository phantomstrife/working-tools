import { useMemo, useState } from 'react';

import { useTranslate } from '@admin-web/locale';

import { PAGE_SIZE_OPTIONS } from './constants';
import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { attendants } = properties;
   const [attSearch, setAttSearch] = useState('');
   const [attFilter, setAttFilter] = useState<Types.AttendantFilter>('ALL');
   const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.attendants_panel',
   });

   const filteredAttendants = useMemo(() => {
      const normalizedSearch = attSearch.trim().toLowerCase();

      return attendants.filter((item) => {
         const matchesSearch =
            !normalizedSearch ||
            item.full_name.toLowerCase().includes(normalizedSearch) ||
            (item.phone?.toLowerCase().includes(normalizedSearch) ?? false) ||
            (item.email?.toLowerCase().includes(normalizedSearch) ?? false) ||
            item.ticket_code.toLowerCase().includes(normalizedSearch);

         if (!matchesSearch) {
            return false;
         }

         if (attFilter === 'CHECKED_IN') {
            return item.is_checked_in;
         }

         if (attFilter === 'NOT_CHECKED_IN') {
            return !item.is_checked_in;
         }

         if (attFilter === 'WINNER') {
            return item.has_won;
         }

         if (attFilter === 'NOT_WINNER') {
            return !item.has_won;
         }

         return true;
      });
   }, [attendants, attSearch, attFilter]);

   const handleSearchChange: Types.Handle_Search_Change = (event) => {
      setAttSearch(event.target.value);
   };

   const handleClearSearch = () => {
      setAttSearch('');
   };

   const handleFilterChange: Types.Handle_Filter_Change = (event) => {
      const value = event.target.value;
      if (
         value === 'ALL' ||
         value === 'CHECKED_IN' ||
         value === 'NOT_CHECKED_IN' ||
         value === 'WINNER' ||
         value === 'NOT_WINNER'
      ) {
         setAttFilter(value);
      }
   };

   const handleLimitChange: Types.Handle_Limit_Change = (event) => {
      setPageSize(Number(event.target.value));
   };

   return {
      param: {
         attendants,
         filteredAttendants,
         attSearch,
         attFilter,
         pageSize,
         pageSizeOptions: PAGE_SIZE_OPTIONS,
      },
      func: {
         translate,
         handleSearchChange,
         handleClearSearch,
         handleFilterChange,
         handleLimitChange,
      },
   };
}
