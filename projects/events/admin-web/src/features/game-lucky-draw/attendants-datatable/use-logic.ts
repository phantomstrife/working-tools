import { useCallback, useEffect } from 'react';

import { PAGE_SIZE_OPTIONS } from '@admin-web/components/datatable/constants';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { useServicesGameLuckyDrawAttendantSearch } from '@admin-web/services/game-lucky-draw/attendant-search';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { gameId } = properties;

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.attendants_panel',
   });

   const [state, setState] = useDeepState<Types.State>({
      attendants: [],
      totalCount: 0,
      search: '',
      filter: '',
      debouncedSearch: '',
      page: 1,
      pageSize: PAGE_SIZE_OPTIONS[0],
      isLoading: true,
   });

   const handleSearch = useCallback(async () => {
      if (!gameId) {
         return;
      }

      setState({
         isLoading: true,
      });

      const servicesGameLuckyDrawAttendantSearch = await useServicesGameLuckyDrawAttendantSearch({
         gameId,
         page: state.page,
         pageSize: state.pageSize,
         search: state.debouncedSearch,
         filter: state.filter,
      });

      if (servicesGameLuckyDrawAttendantSearch.error || !servicesGameLuckyDrawAttendantSearch.data) {
         setState({
            attendants: [],
            totalCount: 0,
         });
         return;
      }

      setState({
         attendants: servicesGameLuckyDrawAttendantSearch.data.attendants,
         totalCount: servicesGameLuckyDrawAttendantSearch.data.totalCount,
      });

      setState({
         isLoading: false,
      });
   }, [gameId, state.page, state.pageSize, state.debouncedSearch, state.filter, setState]);

   const handleSearchChange: Types.HandleSearchChange = (event) => {
      setState({
         search: event.target.value,
      });
   };

   const handleFilterChange: Types.HandleFilterChange = (event) => {
      const nextFilter = event.target.value as Types.Filter;

      setState({
         filter: nextFilter,
         page: 1,
      });
   };

   const handlePageChange: Types.HandlePageChange = (nextPage) => {
      setState({
         page: nextPage,
      });
   };

   const handlePageSizeChange: Types.HandlePageSizeChange = (nextPageSize) => {
      setState({
         page: 1,
         pageSize: nextPageSize,
      });
   };

   useEffect(() => {
      handleSearch();
   }, [handleSearch]);

   useEffect(() => {
      const timer = setTimeout(() => {
         if (state.search !== state.debouncedSearch) {
            setState({
               debouncedSearch: state.search,
               page: 1,
               isLoading: true,
            });
         }
      }, 800);

      return () => {
         clearTimeout(timer);
      };
   }, [state.search, state.debouncedSearch, setState]);

   return {
      param: {
         attendants: state.attendants,
         totalCount: state.totalCount,
         page: state.page,
         pageSize: state.pageSize,
         isLoading: state.isLoading,
      },
      func: {
         translate,
         handleSearchChange,
         handleFilterChange,
         handlePageChange,
         handlePageSizeChange,
      },
   };
}
