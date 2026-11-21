'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Modal } from '@admin-web/components/modal';

import { GAME_RESET_MODAL_ID } from './constants';
import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type * as Types from './type';

export const GameResetModal: AdminWeb.Component<Types.Properties> = (properties) => {
   const { state, param, func } = useLogic(properties);
   const { form, body, game_box, game_label, game_name, scope, options, warning, footer } = useStyle;

   return (
      <Modal
         id={GAME_RESET_MODAL_ID}
         disabled={param.isPending}
         title={func.translate('modal.title')}
         description={func.translate('modal.description')}
         style={{ width: '34rem', bodyClass: 'p-0' }}
      >
         {() => (
            <form
               className={form}
               onSubmit={func.handleSubmit}
            >
               <div className={body}>
                  <div className={game_box}>
                     <span className={game_label}>{func.translate('modal.target_game')}</span>
                     <span className={game_name}>{param.game.name}</span>
                  </div>

                  <div className={scope.wrapper}>
                     <span className={scope.title}>{func.translate('modal.default_scope_title')}</span>
                     <ul className={scope.list}>
                        <li className={scope.item}>
                           <span className={scope.dot} />
                           <span>{func.translate('modal.default_scope_winners')}</span>
                        </li>
                        <li className={scope.item}>
                           <span className={scope.dot} />
                           <span>{func.translate('modal.default_scope_attendants')}</span>
                        </li>
                        <li className={scope.item}>
                           <span className={scope.dot} />
                           <span>{func.translate('modal.default_scope_prizes')}</span>
                        </li>
                     </ul>
                  </div>

                  <div className={options.wrapper}>
                     <span className={options.title}>{func.translate('modal.optional_title')}</span>

                     <label
                        htmlFor="game-reset-check-ins"
                        className={options.card({ disabled: param.isPending || state.deleteAttendants })}
                     >
                        <input
                           id="game-reset-check-ins"
                           type="checkbox"
                           checked={state.resetCheckIns}
                           disabled={param.isPending || state.deleteAttendants}
                           onChange={(event) => func.handleToggleResetCheckIns(event.target.checked)}
                           className={options.checkbox}
                        />
                        <div className={options.content}>
                           <span className={options.label}>{func.translate('modal.reset_check_ins_label')}</span>
                           <span className={options.hint}>{func.translate('modal.reset_check_ins_hint')}</span>
                        </div>
                     </label>

                     <label
                        htmlFor="game-reset-delete-attendants"
                        className={options.card({
                           disabled: param.isPending,
                           danger: state.deleteAttendants,
                        })}
                     >
                        <input
                           id="game-reset-delete-attendants"
                           type="checkbox"
                           checked={state.deleteAttendants}
                           disabled={param.isPending}
                           onChange={(event) => func.handleToggleDeleteAttendants(event.target.checked)}
                           className={options.checkbox}
                        />
                        <div className={options.content}>
                           <span className={options.label_danger}>
                              {func.translate('modal.delete_attendants_label')}
                           </span>
                           <span className={options.hint}>{func.translate('modal.delete_attendants_hint')}</span>
                        </div>
                     </label>
                  </div>

                  {state.deleteAttendants && (
                     <div
                        role="alert"
                        className={warning.box}
                     >
                        <AlertTriangle
                           size={16}
                           className={warning.icon}
                        />
                        <span className={warning.text}>{func.translate('modal.delete_attendants_warning')}</span>
                     </div>
                  )}
               </div>

               <div className={footer.wrapper}>
                  <button
                     type="button"
                     disabled={param.isPending}
                     onClick={func.handleClose}
                     className={footer.cancel_button}
                  >
                     {func.translate('actions.cancel')}
                  </button>
                  <button
                     type="submit"
                     disabled={param.isPending}
                     className={footer.submit_button({ disabled: param.isPending })}
                  >
                     <RotateCcw size={14} />
                     <span>{func.translate(`actions.confirm_saving_${param.isPending}`)}</span>
                  </button>
               </div>
            </form>
         )}
      </Modal>
   );
};
