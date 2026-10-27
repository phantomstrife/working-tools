import { useCallback, useEffect, useImperativeHandle } from 'react';
import { toast } from 'sonner';

import { PAGE_SIZE_OPTIONS } from '@admin-web/components/datatable/constants';
import { useStoreModal } from '@admin-web/components/modal';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { useServicesGameStaffSearch } from '@admin-web/services/game/staff-search';
import { useServicesGameStaffUnassign } from '@admin-web/services/game/staff-unassign';

import { MODAL_ID } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const { ref, className, gameId, isLoading: externalLoading = false, onDataChange } = properties;

   const modalActions = useStoreModal((store) => store.actions);

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.staff_panel',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const [state, setState] = useDeepState<Types.State>({
      staff: [],
      totalCount: 0,
      page: 1,
      pageSize: PAGE_SIZE_OPTIONS[0],
      search: '',
      debouncedSearch: '',
      filter: '',
      isLoading: true,
      targetStaff: null,
      isUnassigning: false,
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

      const searchResult = await useServicesGameStaffSearch({
         gameId,
         page: state.page,
         pageSize: state.pageSize,
         search: state.debouncedSearch,
         filter: state.filter,
      });

      if (searchResult.error || !searchResult.data) {
         setState({
            staff: [],
            totalCount: 0,
            isLoading: false,
         });
         return;
      }

      setState({
         staff: searchResult.data.staff,
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

   const handleAssign = () => {
      setState({
         targetStaff: null,
      });
      modalActions.openModal(MODAL_ID.STAFF_FORM);
   };

   const handleEdit = (member: Types.StaffMember) => {
      setState({
         targetStaff: member,
      });
      modalActions.openModal(MODAL_ID.STAFF_FORM);
   };

   const handleUnassign = (member: Types.StaffMember) => {
      setState({
         targetStaff: member,
      });
      modalActions.openModal(MODAL_ID.UNASSIGN_STAFF);
   };

   const handleConfirmUnassign = async () => {
      if (!state.targetStaff || state.isUnassigning) {
         return;
      }

      setState({
         isUnassigning: true,
      });

      const unassignResult = await useServicesGameStaffUnassign({
         assignmentId: state.targetStaff.id,
         gameId,
      });

      if (unassignResult.error) {
         toast.error(resolveErrorMessage(unassignResult.message));
         setState({
            isUnassigning: false,
         });
         return;
      }

      toast.success(translate('toast.unassign_success'));
      setState({
         isUnassigning: false,
         targetStaff: null,
      });
      modalActions.closeModal(MODAL_ID.UNASSIGN_STAFF);
      void handleSearch();
      onDataChange?.();
   };

   const handleFormSuccess = () => {
      void handleSearch();
      onDataChange?.();
   };

   return {
      param: {
         className,
         gameId,
         staff: state.staff,
         totalCount: state.totalCount,
         page: state.page,
         pageSize: state.pageSize,
         isLoading: state.isLoading || externalLoading,
         targetStaff: state.targetStaff,
         isUnassigning: state.isUnassigning,
      },
      func: {
         translate,
         handleSearchChange,
         handleFilterChange,
         handlePageChange,
         handlePageSizeChange,
         handleAssign,
         handleEdit,
         handleUnassign,
         handleConfirmUnassign,
         handleFormSuccess,
      },
   };
}

