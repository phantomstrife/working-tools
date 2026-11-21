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
      onExportAttendants,
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
      isExportingAttendants: false,
      isSendingEmails: false,
      isSendingAllEmails: false,
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

   const handleExportAttendants = async () => {
      if (state.isExportingAttendants || !gameId) {
         return;
      }

      onExportAttendants?.();

      setState({
         isExportingAttendants: true,
      });

      try {
         const response = await fetch(
            `/api/game-lucky-draw/attendants-export?gameId=${encodeURIComponent(gameId)}`,
            {
               method: 'GET',
               cache: 'no-store',
            },
         );

         if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { message?: string } | null;
            const errorMessage = payload?.message
               ? resolveErrorMessage(payload.message)
               : translate('toast.export_attendants_failed');

            toast.error(errorMessage);
            return;
         }

         const totalCountHeader = response.headers.get('X-Total-Count');
         const totalCount = totalCountHeader !== null ? Number(totalCountHeader) : null;

         if (totalCount === 0) {
            toast.info(translate('toast.export_attendants_empty'));
            return;
         }

         const csvContent = await response.text();
         const contentDisposition = response.headers.get('Content-Disposition') ?? '';
         const fileNameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
         const fileName =
            response.headers.get('X-Export-Filename') ||
            fileNameMatch?.[1] ||
            `attendants-${new Date().toISOString().slice(0, 10)}.csv`;

         downloadCsvFile(csvContent, fileName);
         toast.success(
            translate('toast.export_attendants_success', {
               count: totalCount ?? state.totalCount,
            }),
         );
      } catch {
         toast.error(translate('toast.export_attendants_failed'));
      } finally {
         setState({
            isExportingAttendants: false,
         });
      }
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

   const notifyEmailDispatchResult = (
      dispatchResult: Awaited<ReturnType<typeof useServicesGameLuckyDrawAttendantSendEmails>>,
   ) => {
      if (dispatchResult.error) {
         toast.error(resolveErrorMessage(dispatchResult.message));
         return false;
      }

      if (!dispatchResult.data) {
         return false;
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

      return true;
   };

   const handleSendEmails: Types.HandleSendEmails = async (selectedAttendants, clearSelection) => {
      if (state.isSendingEmails || state.isSendingAllEmails || !gameId || selectedAttendants.length === 0) {
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

      const succeeded = notifyEmailDispatchResult(dispatchResult);

      setState({
         isSendingEmails: false,
      });

      if (succeeded) {
         clearSelection();
      }

      void handleSearch();
   };

   const handleSendAllEmails = () => {
      if (state.isSendingEmails || state.isSendingAllEmails || !gameId) {
         return;
      }

      modalActions.openModal(MODAL_ID.SEND_ALL_EMAILS);
   };

   const handleConfirmSendAllEmails = async () => {
      if (state.isSendingEmails || state.isSendingAllEmails || !gameId) {
         return;
      }

      setState({
         isSendingAllEmails: true,
      });

      const dispatchResult = await useServicesGameLuckyDrawAttendantSendEmails({
         gameId,
         sendAll: true,
      });

      notifyEmailDispatchResult(dispatchResult);

      setState({
         isSendingAllEmails: false,
      });

      modalActions.closeModal(MODAL_ID.SEND_ALL_EMAILS);
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
         isExportingAttendants: state.isExportingAttendants,
         isSendingEmails: state.isSendingEmails,
         isSendingAllEmails: state.isSendingAllEmails,
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
         handleExportAttendants,
         handleExportWinners,
         handleSendEmails,
         handleSendAllEmails,
         handleConfirmSendAllEmails,
      },
   };
}
