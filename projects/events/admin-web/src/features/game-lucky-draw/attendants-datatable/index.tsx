'use client';

import { Download, Mail, Pencil, Plus, Trash2, Upload } from 'lucide-react';

import { DataTable } from '@admin-web/components/datatable';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const AttendantsDatatable: AdminWeb.Component<Types.Properties> = (properties) => {
   const { onImportCsv, onSendEmails, onExportWinners, onCreate, onEdit, onDelete } = properties;

   const { param, func } = useLogic(properties);
   const { cell, action } = useStyle;

   return (
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
               onClick: () => onImportCsv?.(),
            },
            {
               key: 'send-emails',
               label: func.translate('actions.send_emails'),
               icon: Mail,
               disabled: param.isLoading || param.attendants.length === 0,
               onClick: () => onSendEmails?.(),
            },
            {
               key: 'export',
               label: func.translate('actions.export_winners'),
               icon: Download,
               disabled: param.isLoading,
               onClick: () => onExportWinners?.(),
            },
            {
               key: 'create',
               label: func.translate('actions.create'),
               icon: Plus,
               variant: 'primary',
               disabled: param.isLoading,
               onClick: () => onCreate?.(),
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
                        onClick={() => onEdit?.(row)}
                     >
                        <Pencil className={action.icon} />
                     </button>
                     <button
                        type="button"
                        className={action.button({ danger: true })}
                        onClick={() => onDelete?.(row)}
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
   );
};
