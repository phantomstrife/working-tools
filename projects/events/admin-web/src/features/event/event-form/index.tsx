'use client';

import { Activity, Building, Calendar, Clock, FileText, Image, Link2, MapPin } from 'lucide-react';

import { FormField } from '@admin-web/components/form-field';
import { modalFormStyle } from '@admin-web/components/modal/form-style';

import { useLogic } from './use-logic';

import type * as Types from './type';

export const EventForm: AdminWeb.Component<Types.Properties> = (properties) => {
   const { param, func } = useLogic(properties);
   const { form, grid, full_span, footer } = modalFormStyle;

   const nameField = func.register('name');

   return (
      <form
         className={form}
         onSubmit={func.onSubmit}
      >
         <div className={grid}>
            <FormField
               id="event-name"
               Icon={Calendar}
               label={func.translate('fields.name.label')}
               required
               error={param.errors.name?.message}
            >
               <input
                  id="event-name"
                  type="text"
                  placeholder={func.translate('fields.name.placeholder')}
                  {...nameField}
                  onChange={(event) => {
                     void nameField.onChange(event);
                     func.handleNameChange(event);
                  }}
               />
            </FormField>

            <FormField
               id="event-slug"
               Icon={Link2}
               label={func.translate('fields.slug.label')}
               required
               error={param.errors.slug?.message}
            >
               <input
                  id="event-slug"
                  type="text"
                  placeholder={func.translate('fields.slug.placeholder')}
                  {...func.register('slug')}
               />
            </FormField>

            <FormField
               id="event-status"
               Icon={Activity}
               label={func.translate('fields.status.label')}
               required
               error={param.errors.status?.message}
            >
               <select
                  id="event-status"
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
               id="event-location-name"
               Icon={Building}
               label={func.translate('fields.location_name.label')}
               error={param.errors.location_name?.message}
            >
               <input
                  id="event-location-name"
                  type="text"
                  placeholder={func.translate('fields.location_name.placeholder')}
                  {...func.register('location_name')}
               />
            </FormField>

            <FormField
               id="event-start-time"
               Icon={Clock}
               label={func.translate('fields.start_time.label')}
               error={param.errors.start_time?.message}
            >
               <input
                  id="event-start-time"
                  type="datetime-local"
                  {...func.register('start_time')}
               />
            </FormField>

            <FormField
               id="event-end-time"
               Icon={Clock}
               label={func.translate('fields.end_time.label')}
               error={param.errors.end_time?.message}
            >
               <input
                  id="event-end-time"
                  type="datetime-local"
                  {...func.register('end_time')}
               />
            </FormField>

            <FormField
               id="event-location-address"
               className={full_span}
               Icon={MapPin}
               label={func.translate('fields.location_address.label')}
               error={param.errors.location_address?.message}
            >
               <input
                  id="event-location-address"
                  type="text"
                  placeholder={func.translate('fields.location_address.placeholder')}
                  {...func.register('location_address')}
               />
            </FormField>

            <FormField
               id="event-banner-url"
               className={full_span}
               Icon={Image}
               label={func.translate('fields.banner_url.label')}
               error={param.errors.banner_url?.message}
            >
               <input
                  id="event-banner-url"
                  type="url"
                  placeholder={func.translate('fields.banner_url.placeholder')}
                  {...func.register('banner_url')}
               />
            </FormField>

            <FormField
               id="event-description"
               className={full_span}
               Icon={FileText}
               label={func.translate('fields.description.label')}
               error={param.errors.description?.message}
            >
               <input
                  id="event-description"
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
