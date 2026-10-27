'use server';

import { getServerClient } from '@admin-web/adapters/supabase/server';
import { useServicesUserRead } from '@admin-web/services/user/read/server';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import type * as Types from './type';

const normalizeSlug = (value: string): string => {
   return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
};

export const useServicesEventCreate: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const serviceUserRead = await useServicesUserRead();

      if (serviceUserRead.error) {
         throw new Error(serviceUserRead.message);
      }

      const { role, companyId: userCompanyId } = serviceUserRead.data;

      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
         throw new Error('services.user.access_denied');
      }

      const trimmedName = request.name.trim();

      if (!trimmedName) {
         throw new Error('services.event.missing_name');
      }

      const finalSlug = normalizeSlug(request.slug.trim() || trimmedName);

      if (!finalSlug) {
         throw new Error('services.event.missing_slug');
      }

      const supabase = await getServerClient();

      if (request.id) {
         const existingEvent = await supabase
            .from('events')
            .select('id, company_id')
            .eq('id', request.id)
            .single();

         if (existingEvent.error || !existingEvent.data) {
            throw new Error('services.event.not_found');
         }

         if (role === 'ADMIN' && existingEvent.data.company_id !== userCompanyId) {
            throw new Error('services.user.access_denied');
         }

         const updatePayload: AdminWeb.Database.EventUpdate = {
            name: trimmedName,
            slug: finalSlug,
            status: request.status || 'UPCOMING',
            start_time: request.start_time ? new Date(request.start_time).toISOString() : null,
            end_time: request.end_time ? new Date(request.end_time).toISOString() : null,
            location_name: request.location_name?.trim() || null,
            location_address: request.location_address?.trim() || null,
            banner_url: request.banner_url?.trim() || null,
            description: request.description?.trim() || null,
            updated_at: new Date().toISOString(),
         };

         const updated = await supabase
            .from('events')
            .update(updatePayload)
            .eq('id', request.id)
            .select('*, games(*)')
            .single();

         if (updated.error || !updated.data) {
            if (updated.error?.code === '23505') {
               throw new Error('services.event.duplicate_slug');
            }

            throw new Error(updated.error?.message || 'services.event.save_failed');
         }

         return {
            event: updated.data,
         };
      }

      const targetCompanyId = role === 'SUPER_ADMIN' && request.companyId ? request.companyId : userCompanyId;

      if (!targetCompanyId) {
         throw new Error('services.company.not_found');
      }

      if (role === 'ADMIN' && request.companyId && request.companyId !== userCompanyId) {
         throw new Error('services.user.access_denied');
      }

      const insertPayload: AdminWeb.Database.EventInsert = {
         company_id: targetCompanyId,
         name: trimmedName,
         slug: finalSlug,
         status: request.status || 'UPCOMING',
         start_time: request.start_time ? new Date(request.start_time).toISOString() : null,
         end_time: request.end_time ? new Date(request.end_time).toISOString() : null,
         location_name: request.location_name?.trim() || null,
         location_address: request.location_address?.trim() || null,
         banner_url: request.banner_url?.trim() || null,
         description: request.description?.trim() || null,
      };

      const created = await supabase.from('events').insert(insertPayload).select('*').single();

      if (created.error || !created.data) {
         if (created.error?.code === '23505') {
            throw new Error('services.event.duplicate_slug');
         }

         throw new Error(created.error?.message || 'services.event.create_failed');
      }

      return {
         event: {
            ...created.data,
            games: [],
         },
      };
   });
};
