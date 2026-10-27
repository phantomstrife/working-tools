'use client';

import { Download, Mail, Pencil, Plus, Trash2, Upload } from 'lucide-react';

import { DataTable } from '@admin-web/components/datatable';
import { Modal } from '@admin-web/components/modal';
import { AttendantForm } from '@admin-web/features/game-lucky-draw/attendant-form';
import { AttendantImport } from '@admin-web/features/game-lucky-draw/attendant-import';

import { MODAL_ID } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const AttendantsDatatable: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { cell, action, delete_modal } = useStyle;

   return (
      <>
         <DataTable
            title={func.translate('title')}
            totalCount={param.totalCount}
            isLoading={param.isLoading}
            tools={[
               {
                  key: 'import',
                  label: func.translate('actions.import_csv'),
                  icon: Upload,
                  disabled: param.isLoading,
                  onClick: func.handleImportCsv,
               },
               {
                  key: 'send-emails',
                  label: param.isSendingEmails
                     ? func.translate('actions.sending_emails')
                     : func.translate('actions.send_emails'),
                  icon: Mail,
                  batchSelect: true,
                  disabled: param.isLoading || param.isSendingEmails,
                  onClick: func.handleSendEmails,
               },
               {
                  key: 'export',
                  label: param.isExporting
                     ? func.translate('actions.exporting_winners')
                     : func.translate('actions.export_winners'),
                  icon: Download,
                  disabled: param.isLoading || param.isExporting,
                  onClick: func.handleExportWinners,
               },
               {
                  key: 'create',
                  label: func.translate('actions.create'),
                  icon: Plus,
                  variant: 'primary',
                  disabled: param.isLoading,
                  onClick: func.handleCreate,
               },
            ]}
            searchTool={{
               placeholder: func.translate('toolbar.search_placeholder'),
               onChange: func.handleSearchChange,
            }}
            filterTools={[
               {
                  options: [
                     {
                        label: func.translate('toolbar.filters.checkin_group'),
                        options: [
                           {
                              label: func.translate('toolbar.filters.checked_in'),
                              value: 'CHECKED_IN',
                           },
                           {
                              label: func.translate('toolbar.filters.not_checked_in'),
                              value: 'NOT_CHECKED_IN',
                           },
                        ],
                     },
                     {
                        label: func.translate('toolbar.filters.winner_group'),
                        options: [
                           {
                              label: func.translate('toolbar.filters.winner'),
                              value: 'WINNER',
                           },
                           {
                              label: func.translate('toolbar.filters.not_winner'),
                              value: 'NOT_WINNER',
                           },
                        ],
                     },
                     {
                        label: func.translate('toolbar.filters.email_group'),
                        options: [
                           {
                              label: func.translate('toolbar.filters.email_sent'),
                              value: 'EMAIL_SENT',
                           },
                           {
                              label: func.translate('toolbar.filters.email_pending'),
                              value: 'EMAIL_PENDING',
                           },
                        ],
                     },
                  ],
                  onChange: func.handleFilterChange,
               },
            ]}
            data={param.attendants}
            columns={[
               {
                  key: 'full_name',
                  header: func.translate('table.headers.full_name'),
                  emphasis: true,
               },
               {
                  key: 'phone',
                  header: func.translate('table.headers.phone'),
               },
               {
                  key: 'email',
                  header: func.translate('table.headers.email'),
               },
               {
                  key: 'ticket_code',
                  header: func.translate('table.headers.ticket_code'),
                  render: (row) => <span className={cell.ticket_badge}>{row.ticket_code}</span>,
               },
               {
                  key: 'email_status',
                  header: func.translate('table.headers.email_status'),
                  render: (row) => {
                     const status = row.email_status ?? 'NOT_SENT';

                     return (
                        <span
                           className={cell.status_badge({
                              variant: `email_${status}`,
                           })}
                        >
                           {func.translate(`table.badges.email_${status}`)}
                        </span>
                     );
                  },
               },
               {
                  key: 'is_checked_in',
                  header: func.translate('table.headers.checked_in'),
                  render: (row) => (
                     <span
                        className={cell.status_badge({
                           variant: row.is_checked_in ? 'checkedIn' : 'notCheckedIn',
                        })}
                     >
                        {row.is_checked_in
                           ? func.translate('table.badges.checked_in')
                           : func.translate('table.badges.pending')}
                     </span>
                  ),
               },
               {
                  key: 'has_won',
                  header: func.translate('table.headers.has_won'),
                  render: (row) => (
                     <span
                        className={cell.status_badge({
                           variant: row.has_won ? 'winner' : 'notWinner',
                        })}
                     >
                        {row.has_won ? func.translate('table.badges.winner') : func.translate('table.badges.no')}
                     </span>
                  ),
               },
               {
                  key: 'actions',
                  header: func.translate('table.headers.actions'),
                  align: 'right',
                  render: (row) => (
                     <div className={action.wrapper}>
                        <button
                           type="button"
                           className={action.button({ danger: false })}
                           onClick={() => func.handleEdit(row)}
                        >
                           <Pencil className={action.icon} />
                        </button>
                        <button
                           type="button"
                           className={action.button({ danger: true })}
                           onClick={() => func.handleDelete(row)}
                        >
                           <Trash2 className={action.icon} />
                        </button>
                     </div>
                  ),
               },
            ]}
            pagination={{
               page: param.page,
               pageSize: param.pageSize,
               onPageChange: func.handlePageChange,
               onPageSizeChange: func.handlePageSizeChange,
            }}
         />

         <Modal
            id={MODAL_ID.ATTENDANT_FORM}
            title={param.targetAttendant ? func.translate('modals.edit_title') : func.translate('modals.create_title')}
            description={
               param.targetAttendant
                  ? func.translate('modals.edit_description')
                  : func.translate('modals.create_description')
            }
            style={{ width: '42rem', bodyClass: 'p-0' }}
         >
            {(close) => (
               <AttendantForm
                  gameId={param.gameId}
                  attendant={param.targetAttendant}
                  onCancel={close}
                  onSuccess={() => {
                     close();
                     func.refreshAttendants();
                  }}
               />
            )}
         </Modal>

         <Modal
            id={MODAL_ID.IMPORT_CSV}
            title={func.translate('modals.import_title')}
            description={func.translate('modals.import_description')}
            style={{ width: '52rem', bodyClass: 'p-0' }}
         >
            {(close) => (
               <AttendantImport
                  gameId={param.gameId}
                  onCancel={close}
                  onSuccess={func.refreshAttendants}
               />
            )}
         </Modal>

         <Modal
            id={MODAL_ID.DELETE_ATTENDANT}
            disabled={param.isDeleting}
            title={func.translate('modals.delete_title')}
            description={func.translate('modals.delete_description')}
            style={{ width: '28rem' }}
            footer={(close) => (
               <>
                  <button
                     type="button"
                     disabled={param.isDeleting}
                     className={delete_modal.cancel_button}
                     onClick={close}
                  >
                     {func.translate('actions.cancel')}
                  </button>
                  <button
                     type="button"
                     disabled={param.isDeleting}
                     className={delete_modal.confirm_button({ disabled: param.isDeleting })}
                     onClick={func.handleConfirmDelete}
                  >
                     {param.isDeleting ? func.translate('actions.deleting') : func.translate('actions.delete_confirm')}
                  </button>
               </>
            )}
         >
            <p className={delete_modal.message}>
               {func.translate('modals.delete_message', {
                  name: param.targetAttendant?.full_name ?? '',
                  ticket: param.targetAttendant?.ticket_code ?? '',
               })}
            </p>
         </Modal>
      </>
   );
};
