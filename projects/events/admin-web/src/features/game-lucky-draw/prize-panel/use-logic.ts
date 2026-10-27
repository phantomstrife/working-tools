import { useCallback, useEffect, useImperativeHandle } from 'react';
import { toast } from 'sonner';

import { PAGE_SIZE_OPTIONS } from '@admin-web/components/datatable/constants';
import { useStoreModal } from '@admin-web/components/modal';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { useServicesGameLuckyDrawPrizeDelete } from '@admin-web/services/game-lucky-draw/prize-delete';
import { useServicesGameLuckyDrawPrizeSearch } from '@admin-web/services/game-lucky-draw/prize-search';

import { MODAL_ID } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { ref, className, gameId, isLoading: externalLoading = false, onDataChange } = properties;

   const modalActions = useStoreModal((store) => store.actions);

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.prize_panel',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      prizes: [],
      totalCount: 0,
      page: 1,
      pageSize: PAGE_SIZE_OPTIONS[0],
      search: '',
      debouncedSearch: '',
      filter: '',
      isLoading: true,
      targetPrize: null,
      isDeleting: false,
   });

   const resolveErrorMessage = useCallback(
      (message: string) => {
         return message.startsWith('services.') ? translateRoot(message) : message;
      },
      [translateRoot],
   );

   const handleSearch = useCallback(async () => {
      if (!gameId) {
         return;
      }

      setState({
         isLoading: true,
      });

      const searchResult = await useServicesGameLuckyDrawPrizeSearch({
         gameId,
         page: state.page,
         pageSize: state.pageSize,
         search: state.debouncedSearch,
         filter: state.filter,
      });

      if (searchResult.error || !searchResult.data) {
         setState({
            prizes: [],
            totalCount: 0,
            isLoading: false,
         });
         return;
      }

      setState({
         prizes: searchResult.data.prizes,
         totalCount: searchResult.data.totalCount,
         isLoading: false,
      });
   }, [gameId, state.page, state.pageSize, state.debouncedSearch, state.filter, setState]);

   useImperativeHandle(
      ref,
      () => ({
         manualRefresh: handleSearch,
      }),
      [handleSearch],
   );

   useEffect(() => {
      void handleSearch();
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
      }, 600);

      return () => {
         clearTimeout(timer);
      };
   }, [state.search, state.debouncedSearch, setState]);

   const handleSearchChange: Types.HandleSearchChange = (event) => {
      setState({
         search: event.target.value,
      });
   };

   const handleFilterChange: Types.HandleFilterChange = (event) => {
      setState({
         filter: event.target.value as Types.Filter,
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

   const handleCreate = () => {
      setState({
         targetPrize: null,
      });
      modalActions.openModal(MODAL_ID.PRIZE_FORM);
   };

   const handleEdit = (prize: Types.Prize) => {
      setState({
         targetPrize: prize,
      });
      modalActions.openModal(MODAL_ID.PRIZE_FORM);
   };

   const handleDelete = (prize: Types.Prize) => {
      setState({
         targetPrize: prize,
      });

      modalActions.openModal(MODAL_ID.DELETE_PRIZE);
   };

   const handleConfirmDelete = async () => {
      modalActions.closeModal(MODAL_ID.DELETE_PRIZE);

      if (!state.targetPrize || state.isDeleting) {
         return;
      }

      setState({
         isDeleting: true,
      });

      const deleteResult = await useServicesGameLuckyDrawPrizeDelete({
         id: state.targetPrize.id,
         gameId,
      });

      if (deleteResult.error) {
         toast.error(resolveErrorMessage(deleteResult.message));

         setState({
            isDeleting: false,
         });
         return;
      }

      modalActions.closeModal(MODAL_ID.DELETE_PRIZE);
      toast.success(translate('toast.delete_success'));

      setState({
         isDeleting: false,
         targetPrize: null,
      });

      handleSearch();
      onDataChange?.();
   };

   const handleFormSuccess = () => {
      handleSearch();
      onDataChange?.();
   };

   return {
      param: {
         className,
         gameId,
         prizes: state.prizes,
         totalCount: state.totalCount,
         page: state.page,
         pageSize: state.pageSize,
         isLoading: state.isLoading || externalLoading,
         targetPrize: state.targetPrize,
         isDeleting: state.isDeleting,
      },
      func: {
         translate,
         handleSearchChange,
         handleFilterChange,
         handlePageChange,
         handlePageSizeChange,
         handleCreate,
         handleEdit,
         handleDelete,
         handleConfirmDelete,
         handleFormSuccess,
      },
   };
}
