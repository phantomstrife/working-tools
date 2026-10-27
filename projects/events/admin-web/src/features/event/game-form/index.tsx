'use client';

import { Activity, Calendar, FileText, Gamepad2, Sparkles } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';
import { modalFormStyle } from '@admin-web/components/modal/form-style';

import { useLogic } from './use-logic';

import type * as Types from './type';

export const GameForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { form, grid, full_span, footer } = modalFormStyle;

   return (
      <form
         className={form}
         onSubmit={func.onSubmit}
      >
         <div className={grid}>
            <FormField
               id="game-event-id"
               className={full_span}
               Icon={Calendar}
               label={func.translate('fields.event_id.label')}
               required
               error={param.errors.event_id?.message}
            >
               <select
                  id="game-event-id"
                  {...func.register('event_id')}
               >
                  <option value="">{func.translate('fields.event_id.placeholder')}</option>
                  {param.events.map((event) => (
                     <option
                        key={event.id}
                        value={event.id}
                     >
                        {event.name} ({event.status})
                     </option>
                  ))}
               </select>
            </FormField>

            <FormField
               id="game-name"
               className={full_span}
               Icon={Gamepad2}
               label={func.translate('fields.name.label')}
               required
               error={param.errors.name?.message}
            >
               <input
                  id="game-name"
                  type="text"
                  placeholder={func.translate('fields.name.placeholder')}
                  {...func.register('name')}
               />
            </FormField>

            <FormField
               id="game-type"
               Icon={Sparkles}
               label={func.translate('fields.game_type.label')}
               required
               error={param.errors.game_type?.message}
            >
               <select
                  id="game-type"
                  {...func.register('game_type')}
               >
                  {param.gameTypeOptions.map((type) => (
                     <option
                        key={type}
                        value={type}
                     >
                        {func.translate(`game_types.${type}`)}
                     </option>
                  ))}
               </select>
            </FormField>

            <FormField
               id="game-status"
               Icon={Activity}
               label={func.translate('fields.status.label')}
               required
               error={param.errors.status?.message}
            >
               <select
                  id="game-status"
                  {...func.register('status')}
               >
                  {param.statusOptions.map((status) => (
                     <option
                        key={status}
                        value={status}
                     >
                        {func.translate(`statuses.${status}`)}
                     </option>
                  ))}
               </select>
            </FormField>

            <FormField
               id="game-description"
               className={full_span}
               Icon={FileText}
               label={func.translate('fields.description.label')}
               error={param.errors.description?.message}
            >
               <input
                  id="game-description"
                  type="text"
                  placeholder={func.translate('fields.description.placeholder')}
                  {...func.register('description')}
               />
            </FormField>
         </div>

         <div className={footer.wrapper}>
            {func.onCancel && (
               <button
                  type="button"
                  disabled={param.isPending}
                  className={footer.cancel_button}
                  onClick={func.onCancel}
               >
                  {func.translate('actions.cancel')}
               </button>
            )}
            <button
               type="submit"
               disabled={param.isSubmitDisabled}
               className={footer.submit_button({ disabled: param.isSubmitDisabled })}
            >
               {func.translate(`actions.${param.mode}_saving_${param.isPending}`)}
            </button>
         </div>
      </form>
   );
};

