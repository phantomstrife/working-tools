'use server';

import { revalidatePath } from 'next/cache';

import { ROUTE } from '@/constants';
import { getServerClient } from '@/adapters/supabase/server';
import { getAdminClient } from '@/adapters/supabase/admin';

import type * as Types from './type';

export const update: Types.Update = async (request) => {
   const supabase = await getServerClient();
   const authResult = await supabase.auth.getUser();

   if (!authResult.data.user) {
      throw new Error('You must be signed in to update accounts.');
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
   let fields: Types.AccountUpdateFields = { ...request.account };

   if (caller.role === 'ADMIN') {
      if (!caller.company_id) {
         throw new Error('Admin account is not linked to a company.');
      }
      if (fields.role && fields.role !== 'FIELD_STAFF' && fields.role !== 'GUARD') {
         throw new Error('Admins can only assign FIELD_STAFF or GUARD roles.');
      }
      fields = { ...fields, company_id: caller.company_id };
   } else if (caller.role !== 'SUPER_ADMIN') {
      throw new Error('Only SUPER_ADMIN or ADMIN accounts can update accounts.');
   }

   // Verify the target is visible to the caller (RLS scopes ADMIN to their own company).
   const target = await supabase.from('accounts').select('id, email').eq('id', request.id).single();

   if (target.error || !target.data) {
      throw new Error('Account not found or you do not have permission to update it.');
   }

   // Sync credentials with Supabase Auth (login uses auth.users, not public.accounts).
   const hasNewPassword = Boolean(request.password && request.password.length >= 6);
   const hasNewEmail = Boolean(fields.email && fields.email !== target.data.email);

   if (hasNewPassword || hasNewEmail) {
      const admin = getAdminClient();
      const authUpdate = await admin.auth.admin.updateUserById(request.id, {
         ...(hasNewPassword ? { password: request.password } : {}),
         ...(hasNewEmail ? { email: fields.email, email_confirm: true } : {}),
      });

      if (authUpdate.error) {
         throw new Error(authUpdate.error.message);
      }
   }

   const result = await supabase.from('accounts').update(fields).eq('id', request.id).select('id');

   if (result.error) {
      throw new Error(result.error.message);
   }

   if (!result.data || result.data.length === 0) {
      throw new Error('Account was not updated. You may not have permission to modify it.');
   }

   revalidatePath(ROUTE.ADMIN.ACCOUNT.UPDATE(request.id));
   revalidatePath(ROUTE.ADMIN.ACCOUNT.SEARCH);
};
