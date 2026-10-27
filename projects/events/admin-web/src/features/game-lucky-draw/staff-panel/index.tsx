'use client';

import { Plus } from 'lucide-react';

import { ConfirmModal } from '@admin-web/components/confirm-modal';
import { DataTable } from '@admin-web/components/datatable';
import { Modal } from '@admin-web/components/modal';
import { RowActions } from '@admin-web/components/row-actions';
import { StaffForm } from '@admin-web/features/game-lucky-draw/staff-form';

import { MODAL_ID } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const StaffPanel: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { member, role_badge } = useStyle;

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
                  key: 'assign-staff',
                  label: func.translate('actions.assign'),
                  icon: Plus,
                  variant: 'primary',
                  disabled: param.isLoading,
                  onClick: func.handleAssign,
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
                        label: func.translate('toolbar.filters.role_group'),
                        options: [
                           {
                              label: func.translate('toolbar.filters.field_staff'),
                              value: 'FIELD_STAFF',
                           },
                           {
                              label: func.translate('toolbar.filters.guard'),
                              value: 'GUARD',
                           },
                        ],
                     },
                  ],
                  onChange: func.handleFilterChange,
               },
            ]}
            data={param.staff}
            columns={[
               {
                  key: 'full_name',
                  header: func.translate('table.headers.staff_member'),
                  render: (row) => (
                     <div className={member.wrapper}>
                        <div className={member.avatar}>{row.full_name.charAt(0)}</div>
                        <div className={member.info}>
                           <p className={member.name_row}>
                              <span>{row.full_name}</span>
                              {!row.is_active && (
                                 <span
                                    className={member.inactive_dot}
                                    title={func.translate('table.inactive')}
                                 />
                              )}
                           </p>
                           <p className={member.email}>{row.email}</p>
                        </div>
                     </div>
                  ),
               },
               {
                  key: 'role',
                  header: func.translate('table.headers.role'),
                  render: (row) => (
                     <span className={role_badge({ role: row.role })}>{func.translate(`table.roles.${row.role}`)}</span>
                  ),
               },
               {
                  key: 'actions',
                  header: func.translate('table.headers.actions'),
                  align: 'right',
                  render: (row) => (
                     <RowActions
                        onEdit={() => func.handleEdit(row)}
                        onDelete={() => func.handleUnassign(row)}
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
            id={MODAL_ID.STAFF_FORM}
            title={param.targetStaff ? func.translate('modals.edit_title') : func.translate('modals.assign_title')}
            description={
               param.targetStaff
                  ? func.translate('modals.edit_description')
                  : func.translate('modals.assign_description')
            }
            style={{ width: '38rem', bodyClass: 'p-0' }}
         >
            {(close) => (
               <StaffForm
                  gameId={param.gameId}
                  staff={param.targetStaff}
                  onCancel={close}
                  onSuccess={() => {
                     close();
                     func.handleFormSuccess();
                  }}
               />
            )}
         </Modal>

         <ConfirmModal
            id={MODAL_ID.UNASSIGN_STAFF}
            isLoading={param.isUnassigning}
            title={func.translate('modals.unassign_title')}
            description={func.translate('modals.unassign_description')}
            message={func.translate('modals.unassign_message', {
               name: param.targetStaff?.full_name ?? '',
               email: param.targetStaff?.email ?? '',
            })}
            cancelLabel={func.translate('actions.cancel')}
            confirmLabel={func.translate('actions.unassign_confirm')}
            loadingLabel={func.translate('actions.unassigning')}
            onConfirm={func.handleConfirmUnassign}
         />
      </>
   );
};
