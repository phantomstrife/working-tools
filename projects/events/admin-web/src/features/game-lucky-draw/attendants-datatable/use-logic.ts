import { useCallback, useEffect, useImperativeHandle } from 'react';
import { toast } from 'sonner';

import { PAGE_SIZE_OPTIONS } from '@admin-web/components/datatable/constants';
import { useStoreModal } from '@admin-web/components/modal';
import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { useServicesGameLuckyDrawAttendantDelete } from '@admin-web/services/game-lucky-draw/attendant-delete';
import { useServicesGameLuckyDrawAttendantSearch } from '@admin-web/services/game-lucky-draw/attendant-search';
import { useServicesGameLuckyDrawAttendantSendEmails } from '@admin-web/services/game-lucky-draw/attendant-send-emails';
import { useServicesGameLuckyDrawWinnersExportCsv } from '@admin-web/services/game-lucky-draw/winners-export-csv';
import { downloadCsvFile } from '@admin-web/utilities/csv';

import { MODAL_ID } from './constants';

import type * as Types from './type';

export function useLogic(properties: Types.Properties) {
   const {
      ref,
      gameId,
      isLoading: externalLoading = false,
      onImportCsv,
      onSendEmails,
      onExportWinners,
      onCreate,
      onEdit,
      onDelete,
   } = properties;

   const modalActions = useStoreModal((store) => store.actions);

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.attendants_panel',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
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
      targetAttendant: null,
      isDeleting: false,
      isExporting: false,
      isSendingEmails: false,
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
            isLoading: false,
         });
         return;
      }

      setState({
         attendants: servicesGameLuckyDrawAttendantSearch.data.attendants,
         totalCount: servicesGameLuckyDrawAttendantSearch.data.totalCount,
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

   const handleCreate = () => {
      onCreate?.();
      setState({
         targetAttendant: null,
      });
      modalActions.openModal(MODAL_ID.ATTENDANT_FORM);
   };

   const handleEdit = (attendant: Types.Attendant) => {
      onEdit?.(attendant);
      setState({
         targetAttendant: attendant,
      });
      modalActions.openModal(MODAL_ID.ATTENDANT_FORM);
   };

   const handleImportCsv = () => {
      onImportCsv?.();
      modalActions.openModal(MODAL_ID.IMPORT_CSV);
   };

   const handleDelete = (attendant: Types.Attendant) => {
      onDelete?.(attendant);
      setState({
         targetAttendant: attendant,
      });
      modalActions.openModal(MODAL_ID.DELETE_ATTENDANT);
   };

   const handleConfirmDelete = async () => {
      if (!state.targetAttendant || state.isDeleting) {
         return;
      }

      setState({
         isDeleting: true,
      });

      const deleteResult = await useServicesGameLuckyDrawAttendantDelete({
         id: state.targetAttendant.id,
         gameId,
      });

      if (deleteResult.error) {
         toast.error(resolveErrorMessage(deleteResult.message));
         setState({
            isDeleting: false,
         });
         return;
      }

      toast.success(translate('toast.delete_success'));
      setState({
         isDeleting: false,
         targetAttendant: null,
      });
      modalActions.closeModal(MODAL_ID.DELETE_ATTENDANT);
      void handleSearch();
   };

   const handleExportWinners = async () => {
      if (state.isExporting || !gameId) {
         return;
      }

      onExportWinners?.();

      setState({
         isExporting: true,
      });

      const exportResult = await useServicesGameLuckyDrawWinnersExportCsv({
         gameId,
      });

      setState({
         isExporting: false,
      });

      if (exportResult.error) {
         toast.error(resolveErrorMessage(exportResult.message));
         return;
      }

      downloadCsvFile(exportResult.data.csvContent, exportResult.data.fileName);
      toast.success(
         translate('toast.export_success', {
            count: exportResult.data.totalCount,
         }),
      );
   };

   const handleSendEmails: Types.HandleSendEmails = async (selectedAttendants, clearSelection) => {
      if (state.isSendingEmails || !gameId || selectedAttendants.length === 0) {
         return;
      }

      onSendEmails?.(selectedAttendants);

      const attendantIds = selectedAttendants.map((item) => item.id);
      const selectedSet = new Set(attendantIds);
      const optimisticAttendants = state.attendants.map((attendant) =>
         selectedSet.has(attendant.id)
            ? {
                 ...attendant,
                 email_status: 'SENDING' as Types.EmailStatus,
              }
            : attendant,
      );

      setState({
         isSendingEmails: true,
         attendants: optimisticAttendants,
      });

      const dispatchResult = await useServicesGameLuckyDrawAttendantSendEmails({
         gameId,
         attendantIds,
      });

      if (dispatchResult.error) {
         toast.error(resolveErrorMessage(dispatchResult.message));
         setState({
            isSendingEmails: false,
         });
         void handleSearch();
         return;
      }

      const { provider, totalRequested, sentCount, failedCount } = dispatchResult.data;

      if (failedCount === 0) {
         toast.success(
            translate('toast.email_batch_success', {
               sent: sentCount,
               total: totalRequested,
               provider: provider.toUpperCase(),
            }),
         );
      } else {
         toast.warning(
            translate('toast.email_batch_partial', {
               sent: sentCount,
               total: totalRequested,
               failed: failedCount,
               provider: provider.toUpperCase(),
            }),
         );
      }

      setState({
         isSendingEmails: false,
      });

      clearSelection();
      void handleSearch();
   };

   return {
      param: {
         gameId,
         attendants: state.attendants,
         totalCount: state.totalCount,
         page: state.page,
         pageSize: state.pageSize,
         isLoading: state.isLoading || externalLoading,
         targetAttendant: state.targetAttendant,
         isDeleting: state.isDeleting,
         isExporting: state.isExporting,
         isSendingEmails: state.isSendingEmails,
      },
      func: {
         translate,
         refreshAttendants: () => void handleSearch(),
         handleSearchChange,
         handleFilterChange,
         handlePageChange,
         handlePageSizeChange,
         handleCreate,
         handleEdit,
         handleImportCsv,
         handleDelete,
         handleConfirmDelete,
         handleExportWinners,
         handleSendEmails,
      },
   };
}
