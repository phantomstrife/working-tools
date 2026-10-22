'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';
import { getAdminClient } from '@/adapters/supabase/admin';

import type * as Types from './type';

export const create: Types.Create = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to create accounts.');
   }

   const callerProfile = await supabase
      .from('accounts')
      .select('id, role, company_id')
      .eq('id', authResult.data.user.id)
      .single();

   if (!callerProfile.data) {
      throw new Error('Caller account profile not found.');
   }

   const caller = callerProfile.data;

   if (caller.role !== 'SUPER_ADMIN' && caller.role !== 'ADMIN') {
      throw new Error('Only SUPER_ADMIN or ADMIN accounts can create accounts.');
   }

   let fields: Types.AccountCreateFields = { ...request.account };

   if (caller.role === 'ADMIN') {
      if (!caller.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      if (fields.role !== 'FIELD_STAFF' && fields.role !== 'GUARD') {
         throw new Error('Admins are only allowed to create FIELD_STAFF or GUARD accounts.');
      }
      fields = { ...fields, company_id: caller.company_id };
   }

   if (!request.password || request.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
   }

   const admin = getAdminClient();

   // 1. Create the Supabase Auth user so the account can authenticate via signInWithPassword.
   const authCreate = await admin.auth.admin.createUser({
      email: fields.email,
      password: request.password,
      email_confirm: true,
      user_metadata: {
         full_name: fields.full_name,
         username: fields.username ?? '',
         phone: fields.phone ?? '',
      },
      app_metadata: {
         role: fields.role,
         company_id: fields.company_id ?? '',
         created_by: caller.id,
         is_active: fields.is_active ?? true,
      },
   });

   if (authCreate.error || !authCreate.data.user) {
      throw new Error(authCreate.error?.message ?? 'Failed to create authentication user.');
   }

   const newUserId = authCreate.data.user.id;

   // 2. Explicitly upsert the public.accounts profile row with the exact role and company_id
   //    (GoTrue may populate raw_app_meta_data in a post-insert update after the trigger runs).
   const accountResult = await admin
      .from('accounts')
      .upsert(
         {
            id: newUserId,
            email: fields.email,
            password_hash: 'SUPABASE_AUTH_MANAGED',
            full_name: fields.full_name,
            username: fields.username ?? null,
            phone: fields.phone ?? null,
            role: fields.role,
            company_id: fields.company_id ?? null,
            created_by: caller.id,
            is_active: fields.is_active ?? true,
            updated_at: new Date().toISOString(),
         },
         { onConflict: 'id' },
      )
      .select('*')
      .single();

   if (accountResult.error || !accountResult.data) {
      await admin.auth.admin.deleteUser(newUserId);
      throw new Error(accountResult.error?.message ?? 'Failed to save account profile.');
   }

   // 3. Immutable audit trail (inserted with the caller session so RLS `auth.uid() = account_id` passes).
   await supabase.from('logs').insert({
      account_id: caller.id,
      action_type: 'ACCOUNT_CREATE',
      target_entity: 'accounts',
      target_id: newUserId,
      metadata: {
         email: accountResult.data.email,
         role: accountResult.data.role,
         company_id: accountResult.data.company_id,
      },
   });

   revalidatePath(ROUTE.ADMIN.ACCOUNT.SEARCH);

   return {
      account: accountResult.data,
   };
};
