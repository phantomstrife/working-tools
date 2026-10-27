'use client';

import { Gift, Plus } from 'lucide-react';

import { ConfirmModal } from '@admin-web/components/confirm-modal';
import { DataTable } from '@admin-web/components/datatable';
import { Modal } from '@admin-web/components/modal';
import { RowActions } from '@admin-web/components/row-actions';
import { PrizeForm } from '@admin-web/features/game-lucky-draw/prize-form';

import { MODAL_ID, getPrizeStockStatus } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const PrizePanel: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { tier_badge, prize, stock, status_badge } = useStyle;

   return (
      <>
         <DataTable
            compact
            className={param.className}
            title={func.translate('title')}
            totalCount={param.totalCount}
            isLoading={param.isLoading}
            tools={[
               {
                  key: 'create-prize',
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
                        label: func.translate('toolbar.filters.stock_group'),
                        options: [
                           {
                              label: func.translate('toolbar.filters.in_stock'),
                              value: 'IN_STOCK',
                           },
                           {
                              label: func.translate('toolbar.filters.depleted'),
                              value: 'DEPLETED',
                           },
                        ],
                     },
                  ],
                  onChange: func.handleFilterChange,
               },
            ]}
            data={param.prizes}
            columns={[
               {
                  key: 'tier_order',
                  header: func.translate('table.headers.tier'),
                  render: (row) => (
                     <span className={tier_badge}>{func.translate('table.tier_label', { tier: row.tier_order })}</span>
                  ),
               },
               {
                  key: 'name',
                  header: func.translate('table.headers.prize'),
                  render: (row) => (
                     <div className={prize.wrapper}>
                        <div className={prize.thumb}>
                           {row.image_url ? (
                              <img
                                 src={row.image_url}
                                 alt={row.name}
                                 className={prize.image}
                              />
                           ) : (
                              <Gift className={prize.icon} />
                           )}
                        </div>
                        <div className={prize.info}>
                           <p className={prize.name}>{row.name}</p>
                           {row.description && <p className={prize.description}>{row.description}</p>}
                        </div>
                     </div>
                  ),
               },
               {
                  key: 'remaining_quantity',
                  header: func.translate('table.headers.stock'),
                  render: (row) => {
                     const status = getPrizeStockStatus(row.remaining_quantity, row.total_quantity);
                     const ratio =
                        row.total_quantity > 0
                           ? Math.min(100, Math.max(0, (row.remaining_quantity / row.total_quantity) * 100))
                           : 0;

                     return (
                        <div className={stock.wrapper}>
                           <span className={stock.text}>
                              {row.remaining_quantity}{' '}
                              <span className={stock.total}>/ {row.total_quantity}</span>
                           </span>
                           <div className={stock.track}>
                              <div
                                 className={stock.fill({ status })}
                                 style={{ width: `${ratio}%` }}
                              />
                           </div>
                        </div>
                     );
                  },
               },
               {
                  key: 'status',
                  header: func.translate('table.headers.status'),
                  render: (row) => {
                     const status = getPrizeStockStatus(row.remaining_quantity, row.total_quantity);

                     return (
                        <span className={status_badge({ status })}>
                           {func.translate(`table.badges.${status}`)}
                        </span>
                     );
                  },
               },
               {
                  key: 'actions',
                  header: func.translate('table.headers.actions'),
                  align: 'right',
                  render: (row) => (
                     <RowActions
                        onEdit={() => func.handleEdit(row)}
                        onDelete={() => func.handleDelete(row)}
                     />
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
            id={MODAL_ID.PRIZE_FORM}
            title={param.targetPrize ? func.translate('modals.edit_title') : func.translate('modals.create_title')}
            description={
               param.targetPrize
                  ? func.translate('modals.edit_description')
                  : func.translate('modals.create_description')
            }
            style={{ width: '40rem', bodyClass: 'p-0' }}
         >
            {(close) => (
               <PrizeForm
                  gameId={param.gameId}
                  prize={param.targetPrize}
                  onCancel={close}
                  onSuccess={() => {
                     close();
                     func.handleFormSuccess();
                  }}
               />
            )}
         </Modal>

         <ConfirmModal
            id={MODAL_ID.DELETE_PRIZE}
            isLoading={param.isDeleting}
            title={func.translate('modals.delete_title')}
            description={func.translate('modals.delete_description')}
            message={func.translate('modals.delete_message', {
               name: param.targetPrize?.name ?? '',
            })}
            cancelLabel={func.translate('actions.cancel')}
            confirmLabel={func.translate('actions.delete_confirm')}
            loadingLabel={func.translate('actions.deleting')}
            onConfirm={func.handleConfirmDelete}
         />
      </>
   );
};
