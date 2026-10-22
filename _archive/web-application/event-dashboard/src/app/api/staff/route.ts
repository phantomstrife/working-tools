/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['admin', 'guard'] as const;
type Role = (typeof ROLES)[number];

// Only active admins may manage staff accounts.
async function requireAdmin(req: Request) {
   const token = req.headers.get('authorization')?.replace('Bearer ', '');
   if (!token) return null;

   const { data } = await supabaseAdmin.auth.getUser(token);
   if (!data.user) return null;

   const { data: staff } = await supabaseAdmin
      .from('staff')
      .select('role, active')
      .eq('user_id', data.user.id)
      .maybeSingle();

   return staff?.role === 'admin' && staff.active ? data.user : null;
}

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET(req: Request) {
   if (!(await requireAdmin(req))) return unauthorized();

   const { data: rows, error } = await supabaseAdmin
      .from('staff')
      .select('user_id, full_name, role, active, created_at')
      .order('created_at', { ascending: false });
   if (error) return NextResponse.json({ error: error.message }, { status: 500 });

   // Emails live in Supabase Auth, not in the staff table
   const emails = new Map<string, string>();
   for (let page = 1; ; page++) {
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
      data.users.forEach((u) => emails.set(u.id, u.email ?? ''));
      if (data.users.length < 1000) break;
   }

   return NextResponse.json({ staff: (rows ?? []).map((r) => ({ ...r, email: emails.get(r.user_id) ?? '' })) });
}

// Create one or many accounts: { staff: [{ email, full_name, role, password? }] }
// A missing password is generated and returned once in the response.
export async function POST(req: Request) {
   if (!(await requireAdmin(req))) return unauthorized();

   const body = await req.json().catch(() => null);
   const input: any[] = Array.isArray(body?.staff) ? body.staff : [];
   if (input.length === 0) return NextResponse.json({ error: 'No staff provided' }, { status: 400 });
   if (input.length > 200) return NextResponse.json({ error: 'Max 200 accounts per request' }, { status: 400 });

   const created: { email: string; full_name: string; role: Role; password: string; generated: boolean }[] = [];
   const failed: { email: string; reason: string }[] = [];

   for (const item of input) {
      const email = String(item.email ?? '')
         .trim()
         .toLowerCase();
      const fullName = String(item.full_name ?? '').trim();
      const role = String(item.role ?? 'guard').trim().toLowerCase() as Role;
      const givenPassword = String(item.password ?? '').trim();

      if (!EMAIL_RE.test(email)) {
         failed.push({ email, reason: 'Invalid email' });
         continue;
      }
      if (!ROLES.includes(role)) {
         failed.push({ email, reason: `Invalid role "${role}" (use admin or guard)` });
         continue;
      }
      if (givenPassword && givenPassword.length < 8) {
         failed.push({ email, reason: 'Password must be at least 8 characters' });
         continue;
      }

      const password = givenPassword || randomBytes(9).toString('base64url');
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
         email,
         password,
         email_confirm: true,
      });
      if (error || !data.user) {
         failed.push({ email, reason: error?.message ?? 'Could not create user' });
         continue;
      }

      const { error: staffError } = await supabaseAdmin
         .from('staff')
         .insert({ user_id: data.user.id, full_name: fullName || email, role });
      if (staffError) {
         // Don't leave a login without a role behind
         await supabaseAdmin.auth.admin.deleteUser(data.user.id);
         failed.push({ email, reason: staffError.message });
         continue;
      }

      created.push({ email, full_name: fullName || email, role, password, generated: !givenPassword });
   }

   return NextResponse.json({ created, failed });
}

// Update an account: { userId, full_name?, role?, active?, password? }
export async function PATCH(req: Request) {
   const admin = await requireAdmin(req);
   if (!admin) return unauthorized();

   const body = await req.json().catch(() => null);
   const userId: string | undefined = body?.userId;
   if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

   if (userId === admin.id && (body.active === false || (body.role && body.role !== 'admin'))) {
      return NextResponse.json({ error: "You can't deactivate or demote your own account" }, { status: 400 });
   }

   const update: Record<string, unknown> = {};
   if (typeof body.full_name === 'string') update.full_name = body.full_name.trim();
   if (typeof body.active === 'boolean') update.active = body.active;
   if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      update.role = body.role;
   }

   if (Object.keys(update).length > 0) {
      const { error } = await supabaseAdmin.from('staff').update(update).eq('user_id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
   }

   if (body.password !== undefined) {
      if (typeof body.password !== 'string' || body.password.length < 8) {
         return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: body.password });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
   }

   return NextResponse.json({ success: true });
}
