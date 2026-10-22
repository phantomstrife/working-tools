/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import Link from 'next/link';
import {
   Mail,
   Upload,
   Layers,
   Calendar,
   Plus,
   Trash2,
   Gift,
   Users,
   Pencil,
   UserCog,
   Search,
   X,
   CheckCircle2,
   AlertTriangle,
   AlertCircle,
} from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const chunk = <T,>(arr: T[], size = 500): T[][] =>
   Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

// Short numeric codes, all the same length, unique within the event.
// Same-length codes matter because the lucky-draw reels use the code length.
function generateCodes(count: number, used: Set<string>): string[] {
   const existingLen = used.size ? [...used][0].length : 0;
   const len = existingLen || Math.max(3, String(count * 10).length);
   const space = 10 ** len;
   if (used.size + count > space * 0.9) {
      throw new Error(`Not enough ${len}-digit codes for ${used.size + count} customers.`);
   }
   const out: string[] = [];
   while (out.length < count) {
      const code = String(Math.floor(Math.random() * space)).padStart(len, '0');
      if (used.has(code)) continue;
      used.add(code);
      out.push(code);
   }
   return out;
}

type StatusFilter = 'all' | 'imported' | 'email_sent' | 'replied_scanned' | 'winners';
type ToastKind = 'success' | 'warning' | 'error';

interface ToastItem {
   id: number;
   kind: ToastKind;
   text: string;
}

const inputClass =
   'w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed';

export default function AdminDashboard() {
   const [categories, setCategories] = useState<any[]>([]);
   const [events, setEvents] = useState<any[]>([]);
   const [selectedCategory, setSelectedCategory] = useState<string>('');
   const [selectedEvent, setSelectedEvent] = useState<string>('');

   // Active tab toggle: 'customers' | 'prizes'
   const [activeTab, setActiveTab] = useState<'customers' | 'prizes'>('customers');

   // Customers state
   const [customers, setCustomers] = useState<any[]>([]);
   const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
   const [loadingCustomers, setLoadingCustomers] = useState(false);

   // Customer search & status filter state
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

   // Prizes state
   const [prizes, setPrizes] = useState<any[]>([]);
   const [loadingPrizes, setLoadingPrizes] = useState(false);
   const [prizeModalOpen, setPrizeModalOpen] = useState(false);
   const [prizeName, setPrizeName] = useState('');
   const [prizeImageUrl, setPrizeImageUrl] = useState('');
   const [prizeQuantity, setPrizeQuantity] = useState(1);

   // Email modal state
   const [emailModalOpen, setEmailModalOpen] = useState(false);
   const [emailSubject, setEmailSubject] = useState('Your Exclusive Ticket & QR Pass');
   const [emailBody, setEmailBody] = useState(
      'Hi {{name}},\n\nThank you for registering! Please scan the QR code below at the event check-in counter.',
   );
   const [sendingEmail, setSendingEmail] = useState(false);

   // Edit customer modal state
   const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
   const [editForm, setEditForm] = useState({ name: '', phone: '', ticket_code: '', status: 'imported' });
   const [savingCustomer, setSavingCustomer] = useState(false);
   const [lengthWarningLen, setLengthWarningLen] = useState<number | null>(null);

   // Category / Event / Delete Prize modals (replacing native prompt/confirm)
   const [categoryModalOpen, setCategoryModalOpen] = useState(false);
   const [newCategoryName, setNewCategoryName] = useState('');
   const [eventModalOpen, setEventModalOpen] = useState(false);
   const [newEventTitle, setNewEventTitle] = useState('');
   const [deletingPrize, setDeletingPrize] = useState<any | null>(null);

   // Toast notifications (replacing native alert)
   const [toasts, setToasts] = useState<ToastItem[]>([]);
   const toastIdRef = useRef(1);

   const showToast = (kind: ToastKind, text: string) => {
      const id = toastIdRef.current++;
      setToasts((prev) => [...prev, { id, kind, text }]);
      setTimeout(() => {
         setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
   };

   const dismissToast = (id: number) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
   };

   const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
   };

   const fetchEvents = async (categoryId: string) => {
      const { data } = await supabase.from('events').select('*').eq('category_id', categoryId).order('title');
      setEvents(data || []);
   };

   const fetchCustomers = async (eventId: string) => {
      setLoadingCustomers(true);
      const { data, error } = await supabase
         .from('event_registrations')
         .select(
            'id, customer_id, ticket_code, status, scanned_at, drawn_at, prize_pool_id, customers(name, email, phone)',
         )
         .eq('event_id', eventId)
         .order('created_at', { ascending: false });

      if (error) {
         console.error('registrations error:', error.message);
         showToast('error', `Failed to load customers: ${error.message}`);
      }

      setCustomers(
         (data || []).map((r: any) => ({
            id: r.id,
            customer_id: r.customer_id,
            name: r.customers?.name ?? '',
            email: r.customers?.email ?? '',
            phone: r.customers?.phone ?? '',
            ticket_code: r.ticket_code,
            status: r.status,
            scanned_at: r.scanned_at,
            prize_pool_id: r.prize_pool_id,
         })),
      );
      setSelectedCustomers([]);
      setLoadingCustomers(false);
   };

   const fetchPrizes = async (eventId: string) => {
      setLoadingPrizes(true);
      const { data } = await supabase
         .from('prize_pools')
         .select('*')
         .eq('event_id', eventId)
         .order('created_at', { ascending: true });
      setPrizes(data || []);
      setLoadingPrizes(false);
   };

   // Category & Event Creation via Modals
   const handleCreateCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      const name = newCategoryName.trim();
      if (!name) return;
      const { error } = await supabase.from('categories').insert([{ name }]);
      if (error) {
         showToast('error', `Error creating category: ${error.message}`);
      } else {
         showToast('success', `Category "${name}" created.`);
         setNewCategoryName('');
         setCategoryModalOpen(false);
         fetchCategories();
      }
   };

   const handleCreateEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      const title = newEventTitle.trim();
      if (!selectedCategory || !title) return;
      const { error } = await supabase.from('events').insert([{ category_id: selectedCategory, title }]);
      if (error) {
         showToast('error', `Error creating event: ${error.message}`);
      } else {
         showToast('success', `Event "${title}" created.`);
         setNewEventTitle('');
         setEventModalOpen(false);
         fetchEvents(selectedCategory);
      }
   };

   // --- PRIZE POOL CRUD ---
   const handleCreateOrUpdatePrize = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedEvent || !prizeName.trim()) return;

      const { error } = await supabase.from('prize_pools').insert([
         {
            event_id: selectedEvent,
            name: prizeName.trim(),
            image_url: prizeImageUrl.trim() || 'https://via.placeholder.com/300x400?text=Prize',
            quantity: Number(prizeQuantity),
         },
      ]);

      if (error) {
         showToast('error', 'Error creating prize: ' + error.message);
      } else {
         showToast('success', `Prize "${prizeName.trim()}" added.`);
         setPrizeName('');
         setPrizeImageUrl('');
         setPrizeQuantity(1);
         setPrizeModalOpen(false);
         fetchPrizes(selectedEvent);
      }
   };

   const requestDeletePrize = (prize: any) => {
      const won = customers.filter((c) => c.prize_pool_id === prize.id).length;
      if (won > 0) {
         showToast('warning', `This prize already has ${won} winner(s) and cannot be deleted.`);
         return;
      }
      setDeletingPrize(prize);
   };

   const confirmDeletePrize = async () => {
      if (!deletingPrize) return;
      const prize = deletingPrize;
      setDeletingPrize(null);

      const { error } = await supabase.from('prize_pools').delete().eq('id', prize.id);
      if (error) {
         showToast('error', 'Error deleting prize: ' + error.message);
      } else {
         showToast('success', `Deleted prize "${prize.name}".`);
         fetchPrizes(selectedEvent);
      }
   };

   const handlePrizeCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0];
      if (!file || !selectedEvent) {
         showToast('warning', 'Select an event first.');
         return;
      }

      Papa.parse(file, {
         header: true,
         skipEmptyLines: true,
         complete: async (results) => {
            try {
               const rows = results.data as any[];
               const prizeRows = rows.map((row) => ({
                  event_id: selectedEvent,
                  name: row.name || row.Name,
                  image_url: row.image_url || row.imageUrl || 'https://via.placeholder.com/300x400?text=Prize',
                  quantity: parseInt(row.quantity || row.Quantity || '1'),
               }));

               const { error } = await supabase.from('prize_pools').insert(prizeRows);
               if (error) {
                  showToast('error', 'Error importing prizes CSV: ' + error.message);
               } else {
                  showToast('success', `Imported ${prizeRows.length} prize pool(s).`);
                  fetchPrizes(selectedEvent);
               }
            } finally {
               input.value = '';
            }
         },
      });
   };

   // --- CANDIDATE CSV UPLOAD ---
   const importCustomers = async (rows: Record<string, string>[]) => {
      const byEmail = new Map<string, { name: string; email: string; code?: string }>();
      let invalid = 0;
      for (const r of rows) {
         const email = (r.email || '').trim().toLowerCase();
         const name = (r.name || '').trim();
         if (!name || !EMAIL_RE.test(email)) {
            invalid++;
            continue;
         }
         if (!byEmail.has(email)) {
            byEmail.set(email, { name, email, code: (r.ticket_code || r.ticket || '').trim() || undefined });
         }
      }
      const unique = [...byEmail.values()];
      if (!unique.length) throw new Error('No valid rows. The CSV needs "name" and "email" columns.');

      const customerIds = new Map<string, string>();
      for (const part of chunk(unique)) {
         const { data, error } = await supabase
            .from('customers')
            .upsert(
               part.map(({ name, email }) => ({ name, email })),
               { onConflict: 'email' },
            )
            .select('id, email');
         if (error) throw error;
         data!.forEach((c) => customerIds.set(c.email, c.id));
      }

      const { data: existing, error: exErr } = await supabase
         .from('event_registrations')
         .select('customer_id, ticket_code')
         .eq('event_id', selectedEvent);
      if (exErr) throw exErr;

      const registered = new Set((existing || []).map((r) => r.customer_id));
      const usedCodes = new Set((existing || []).map((r) => r.ticket_code));
      const fresh = unique.filter((u) => !registered.has(customerIds.get(u.email)!));

      const needGenerated: typeof fresh = [];
      const regRows: any[] = [];
      for (const u of fresh) {
         if (u.code && !usedCodes.has(u.code)) {
            usedCodes.add(u.code);
            regRows.push({ event_id: selectedEvent, customer_id: customerIds.get(u.email), ticket_code: u.code });
         } else {
            needGenerated.push(u);
         }
      }
      const codes = generateCodes(needGenerated.length, usedCodes);
      needGenerated.forEach((u, i) =>
         regRows.push({ event_id: selectedEvent, customer_id: customerIds.get(u.email), ticket_code: codes[i] }),
      );

      for (const part of chunk(regRows)) {
         const { error } = await supabase
            .from('event_registrations')
            .upsert(part, { onConflict: 'event_id,customer_id', ignoreDuplicates: true });
         if (error) throw error;
      }

      showToast(
         'success',
         `Added ${regRows.length} customer(s) (${unique.length - fresh.length} already registered, ${invalid} invalid skipped).`,
      );
      fetchCustomers(selectedEvent);
   };

   const handleCandidateCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0];
      if (!file || !selectedEvent) {
         showToast('warning', 'Select an event first.');
         return;
      }

      Papa.parse<Record<string, string>>(file, {
         header: true,
         skipEmptyLines: true,
         transformHeader: (h) => h.trim().toLowerCase(),
         complete: async (results) => {
            try {
               await importCustomers(results.data);
            } catch (err: any) {
               showToast('error', 'Error importing customers CSV: ' + (err.message ?? err));
            } finally {
               input.value = '';
            }
         },
      });
   };

   // Filtered customer rows
   const filteredCustomers = useMemo(() => {
      const q = searchQuery.trim().toLowerCase();
      return customers.filter((c) => {
         if (statusFilter === 'imported' && c.status !== 'imported') return false;
         if (statusFilter === 'email_sent' && c.status !== 'email_sent') return false;
         if (statusFilter === 'replied_scanned' && c.status !== 'replied_scanned') return false;
         if (statusFilter === 'winners' && !c.prize_pool_id) return false;

         if (!q) return true;
         return (
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q) ||
            (c.ticket_code || '').toLowerCase().includes(q)
         );
      });
   }, [customers, searchQuery, statusFilter]);

   const allFilteredSelected =
      filteredCustomers.length > 0 && filteredCustomers.every((c) => selectedCustomers.includes(c.id));

   const handleSelectAllFiltered = (checked: boolean) => {
      const visibleIds = filteredCustomers.map((c) => c.id);
      if (checked) {
         setSelectedCustomers((prev) => Array.from(new Set([...prev, ...visibleIds])));
      } else {
         const visibleSet = new Set(visibleIds);
         setSelectedCustomers((prev) => prev.filter((id) => !visibleSet.has(id)));
      }
   };

   const handleToggleSelect = (id: string) => {
      setSelectedCustomers((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
   };

   const handleSendEmails = async () => {
      if (selectedCustomers.length === 0) return;
      setSendingEmail(true);

      try {
         const {
            data: { session },
         } = await supabase.auth.getSession();

         const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${session?.access_token ?? ''}`,
            },
            body: JSON.stringify({
               registrationIds: selectedCustomers,
               customSubject: emailSubject,
               customBody: emailBody,
            }),
         });

         const result = await res.json();
         if (res.ok) {
            const failedCount = result.failed?.length ?? 0;
            showToast(
               failedCount > 0 ? 'warning' : 'success',
               `Sent ${result.count} email pass(es)${failedCount ? ` (${failedCount} failed)` : ''}.`,
            );
            setEmailModalOpen(false);
            fetchCustomers(selectedEvent);
         } else {
            showToast('error', 'Error: ' + result.error);
         }
      } catch (err: any) {
         showToast('error', 'Failed to send emails: ' + err.message);
      } finally {
         setSendingEmail(false);
      }
   };

   const openEditCustomer = (customer: any) => {
      setEditingCustomer(customer);
      setLengthWarningLen(null);
      setEditForm({
         name: customer.name,
         phone: customer.phone,
         ticket_code: customer.ticket_code,
         status: customer.status,
      });
   };

   const persistCustomerEdit = async () => {
      if (!editingCustomer) return;
      const name = editForm.name.trim();
      const phone = editForm.phone.trim();
      const ticketCode = editForm.ticket_code.trim();

      setSavingCustomer(true);
      setLengthWarningLen(null);
      try {
         const { error: customerError } = await supabase
            .from('customers')
            .update({ name, phone: phone || null })
            .eq('id', editingCustomer.customer_id);
         if (customerError) throw customerError;

         const registrationUpdate: Record<string, unknown> = {
            ticket_code: ticketCode,
            status: editForm.status,
         };
         if (editForm.status !== editingCustomer.status) {
            registrationUpdate.scanned_at = editForm.status === 'replied_scanned' ? new Date().toISOString() : null;
         }

         const { error: registrationError } = await supabase
            .from('event_registrations')
            .update(registrationUpdate)
            .eq('id', editingCustomer.id);
         if (registrationError) throw registrationError;

         showToast('success', `Updated customer "${name}".`);
         setEditingCustomer(null);
         fetchCustomers(selectedEvent);
      } catch (err: any) {
         showToast('error', 'Failed to save customer: ' + (err.message ?? err));
      } finally {
         setSavingCustomer(false);
      }
   };

   const handleSaveCustomer = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingCustomer) return;

      const name = editForm.name.trim();
      const ticketCode = editForm.ticket_code.trim();
      if (!name || !ticketCode) {
         showToast('warning', 'Name and ticket code are required.');
         return;
      }

      const duplicate = customers.some((c) => c.id !== editingCustomer.id && c.ticket_code === ticketCode);
      if (duplicate) {
         showToast('error', `Ticket code "${ticketCode}" is already used in this event.`);
         return;
      }

      const otherLen = customers.find((c) => c.id !== editingCustomer.id)?.ticket_code?.length;
      if (otherLen && otherLen !== ticketCode.length && lengthWarningLen === null) {
         setLengthWarningLen(otherLen);
         return;
      }

      await persistCustomerEdit();
   };

   useEffect(() => {
      fetchCategories();
   }, []);

   useEffect(() => {
      if (selectedCategory) {
         fetchEvents(selectedCategory);
      } else {
         setEvents([]);
         setSelectedEvent('');
      }
   }, [selectedCategory]);

   useEffect(() => {
      if (selectedEvent) {
         setSearchQuery('');
         setStatusFilter('all');
         fetchCustomers(selectedEvent);
         fetchPrizes(selectedEvent);
      } else {
         setCustomers([]);
         setPrizes([]);
      }
   }, [selectedEvent, fetchCustomers]);

   const totalCustomers = customers.length;
   const importedCount = customers.filter((c) => c.status === 'imported').length;
   const emailOnlyCount = customers.filter((c) => c.status === 'email_sent').length;
   const sentCount = customers.filter((c) => c.status === 'email_sent' || c.status === 'replied_scanned').length;
   const repliedCount = customers.filter((c) => c.status === 'replied_scanned').length;
   const wonCount = customers.filter((c) => c.prize_pool_id).length;

   const filterPills: { key: StatusFilter; label: string; count: number }[] = [
      { key: 'all', label: 'All', count: totalCustomers },
      { key: 'imported', label: 'Imported', count: importedCount },
      { key: 'email_sent', label: 'Email Sent', count: emailOnlyCount },
      { key: 'replied_scanned', label: 'Checked In', count: repliedCount },
      { key: 'winners', label: 'Winners', count: wonCount },
   ];

   return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-8">
         {/* Non-blocking Toast Stack */}
         {toasts.length > 0 && (
            <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
               {toasts.map((t) => (
                  <div
                     key={t.id}
                     className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium ${
                        t.kind === 'success'
                           ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                           : t.kind === 'error'
                             ? 'bg-red-950/90 border-red-800 text-red-200'
                             : 'bg-amber-950/90 border-amber-700 text-amber-200'
                     }`}
                  >
                     <div className="flex items-start gap-2.5">
                        {t.kind === 'success' ? (
                           <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : t.kind === 'error' ? (
                           <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                           <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <span>{t.text}</span>
                     </div>
                     <button
                        onClick={() => dismissToast(t.id)}
                        className="text-current opacity-70 hover:opacity-100 transition-opacity"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
               ))}
            </div>
         )}

         {/* Header */}
         <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-slate-800 pb-6">
            <div>
               <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Event Operations Dashboard</h1>
               <p className="text-slate-400 text-sm mt-1">
                  Manage categories, events, prize pools, guest check-in statuses, and QR passes.
               </p>
            </div>

            <div className="flex flex-wrap gap-3">
               <Link
                  href="/staff"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
               >
                  <UserCog className="w-4 h-4 text-indigo-400" /> Staff Accounts
               </Link>
               <button
                  onClick={() => setCategoryModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
               >
                  <Plus className="w-4 h-4" /> Add Category
               </button>
               <button
                  onClick={() => {
                     if (!selectedCategory) {
                        showToast('warning', 'Select a category first before adding an event.');
                        return;
                     }
                     setEventModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
               >
                  <Plus className="w-4 h-4" /> Add Event
               </button>
            </div>
         </div>

         {/* Selectors Bar */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
            <div className="flex items-center gap-3">
               <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
               <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={inputClass}
               >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                     <option key={cat.id} value={cat.id}>
                        {cat.name}
                     </option>
                  ))}
               </select>
            </div>

            <div className="flex items-center gap-3">
               <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
               <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  disabled={!selectedCategory}
                  className={inputClass}
               >
                  <option value="">-- Select Event --</option>
                  {events.map((evt) => (
                     <option key={evt.id} value={evt.id}>
                        {evt.title}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {selectedEvent ? (
            <>
               {/* Stats Cards */}
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80">
                     <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Guests</p>
                     <p className="text-3xl font-bold mt-2 text-white tabular-nums">{totalCustomers}</p>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80">
                     <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Passes Sent</p>
                     <p className="text-3xl font-bold mt-2 text-blue-400 tabular-nums">{sentCount}</p>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80">
                     <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Checked In</p>
                     <p className="text-3xl font-bold mt-2 text-emerald-400 tabular-nums">{repliedCount}</p>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80">
                     <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Prize Pools</p>
                     <p className="text-3xl font-bold mt-2 text-yellow-400 tabular-nums">{prizes.length}</p>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80">
                     <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Winners</p>
                     <p className="text-3xl font-bold mt-2 text-pink-400 tabular-nums">{wonCount}</p>
                  </div>
               </div>

               {/* Navigation Tabs */}
               <div className="flex border-b border-slate-800 mb-6 gap-6">
                  <button
                     onClick={() => setActiveTab('customers')}
                     className={`flex items-center gap-2 pb-3 font-semibold text-sm border-b-2 transition tabular-nums ${
                        activeTab === 'customers'
                           ? 'border-indigo-500 text-indigo-400'
                           : 'border-transparent text-slate-400 hover:text-slate-200'
                     }`}
                  >
                     <Users className="w-4 h-4" /> Customers Management ({totalCustomers})
                  </button>
                  <button
                     onClick={() => setActiveTab('prizes')}
                     className={`flex items-center gap-2 pb-3 font-semibold text-sm border-b-2 transition tabular-nums ${
                        activeTab === 'prizes'
                           ? 'border-indigo-500 text-indigo-400'
                           : 'border-transparent text-slate-400 hover:text-slate-200'
                     }`}
                  >
                     <Gift className="w-4 h-4" /> Prize Pools Management ({prizes.length})
                  </button>
               </div>

               {/* Tab 1: Customers Section */}
               {activeTab === 'customers' && (
                  <div className="space-y-4">
                     {/* Action & Search/Filter Toolbar */}
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                        <div className="flex flex-wrap items-center gap-3">
                           <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                              <Upload className="w-4 h-4" /> Import Customers CSV
                              <input type="file" accept=".csv" onChange={handleCandidateCSVUpload} className="hidden" />
                           </label>

                           {selectedCustomers.length > 0 && (
                              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                                 <button
                                    onClick={() => setEmailModalOpen(true)}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors tabular-nums"
                                 >
                                    <Mail className="w-4 h-4" /> Send Pass Email ({selectedCustomers.length})
                                 </button>
                                 <button
                                    onClick={() => setSelectedCustomers([])}
                                    className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors"
                                 >
                                    Clear selection
                                 </button>
                              </div>
                           )}
                        </div>

                        {/* Search + Status Filter Pills */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                           <div className="relative min-w-64">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                 type="text"
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 placeholder="Search name, email, phone, ticket..."
                                 className="w-full rounded-lg bg-slate-900 border border-slate-700 pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                              />
                              {searchQuery && (
                                 <button
                                    onClick={() => setSearchQuery('')}
                                    title="Clear search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                 >
                                    <X className="w-4 h-4" />
                                 </button>
                              )}
                           </div>

                           <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-700">
                              {filterPills.map((pill) => {
                                 const active = statusFilter === pill.key;
                                 return (
                                    <button
                                       key={pill.key}
                                       type="button"
                                       onClick={() => setStatusFilter(pill.key)}
                                       className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors tabular-nums ${
                                          active
                                             ? 'bg-indigo-600 text-white shadow'
                                             : 'text-slate-400 hover:text-slate-200'
                                       }`}
                                    >
                                       {pill.label} ({pill.count})
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-800/80 rounded-xl border border-slate-700/80 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                 <th className="p-4 w-12 text-center">
                                    <input
                                       type="checkbox"
                                       checked={allFilteredSelected}
                                       onChange={(e) => handleSelectAllFiltered(e.target.checked)}
                                       className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                                    />
                                 </th>
                                 <th className="p-4">Customer Name</th>
                                 <th className="p-4">Email</th>
                                 <th className="p-4">Phone</th>
                                 <th className="p-4">Ticket Code</th>
                                 <th className="p-4">Status</th>
                                 <th className="p-4">Checked In At</th>
                                 <th className="p-4">Prize Won</th>
                                 <th className="p-4 w-16 text-right">Edit</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/70 text-sm">
                              {loadingCustomers ? (
                                 Array.from({ length: 4 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                       <td colSpan={9} className="p-4">
                                          <div className="h-6 bg-slate-700/40 rounded-lg" />
                                       </td>
                                    </tr>
                                 ))
                              ) : filteredCustomers.length === 0 ? (
                                 <tr>
                                    <td colSpan={9} className="p-12 text-center text-slate-400">
                                       {customers.length === 0
                                          ? 'No customers imported for this event yet. Use "Import Customers CSV" above.'
                                          : 'No customers match your current search or status filter.'}
                                    </td>
                                 </tr>
                              ) : (
                                 filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-700/40 transition-colors">
                                       <td className="p-4 text-center">
                                          <input
                                             type="checkbox"
                                             checked={selectedCustomers.includes(customer.id)}
                                             onChange={() => handleToggleSelect(customer.id)}
                                             className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                                          />
                                       </td>
                                       <td className="p-4 font-medium text-white">{customer.name}</td>
                                       <td className="p-4 text-slate-300">{customer.email}</td>
                                       <td className="p-4 text-slate-400 font-mono text-xs">{customer.phone || '-'}</td>
                                       <td className="p-4 font-mono tracking-wider font-semibold text-indigo-300">
                                          {customer.ticket_code}
                                       </td>
                                       <td className="p-4">
                                          {customer.status === 'imported' && (
                                             <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-700/70 text-slate-300 border border-slate-600">
                                                Imported
                                             </span>
                                          )}
                                          {customer.status === 'email_sent' && (
                                             <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-950/70 text-blue-300 border border-blue-800">
                                                Email Sent
                                             </span>
                                          )}
                                          {customer.status === 'replied_scanned' && (
                                             <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-700">
                                                Checked In
                                             </span>
                                          )}
                                       </td>
                                       <td className="p-4 text-slate-400 text-xs tabular-nums">
                                          {customer.scanned_at ? new Date(customer.scanned_at).toLocaleString() : '-'}
                                       </td>
                                       <td className="p-4">
                                          {customer.prize_pool_id ? (
                                             <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-950/60 text-yellow-300 border border-yellow-700">
                                                {prizes.find((p) => p.id === customer.prize_pool_id)?.name ?? 'Prize'}
                                             </span>
                                          ) : (
                                             <span className="text-slate-500">-</span>
                                          )}
                                       </td>
                                       <td className="p-4 text-right">
                                          <button
                                             onClick={() => openEditCustomer(customer)}
                                             title="Edit customer"
                                             className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                          >
                                             <Pencil className="w-4 h-4" />
                                          </button>
                                       </td>
                                    </tr>
                                 ))
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {/* Tab 2: Prize Pools Section */}
               {activeTab === 'prizes' && (
                  <div>
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => setPrizeModalOpen(true)}
                              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                           >
                              <Plus className="w-4 h-4" /> Add Prize Manually
                           </button>

                           <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                              <Upload className="w-4 h-4" /> Import Prizes CSV
                              <input type="file" accept=".csv" onChange={handlePrizeCSVUpload} className="hidden" />
                           </label>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {loadingPrizes ? (
                           <div className="col-span-3 p-8 text-center text-slate-400">Loading prize pools...</div>
                        ) : prizes.length === 0 ? (
                           <div className="col-span-3 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center text-slate-400">
                              No prize pools created for this event yet.
                           </div>
                        ) : (
                           prizes.map((prize) => (
                              <div
                                 key={prize.id}
                                 className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden flex flex-col justify-between"
                              >
                                 <div>
                                    <div className="h-48 bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-700">
                                       <img
                                          src={prize.image_url}
                                          alt={prize.name}
                                          className="object-contain w-full h-full p-2"
                                       />
                                    </div>
                                    <div className="p-4">
                                       <h3 className="font-bold text-lg text-white mb-1">{prize.name}</h3>
                                       <p className="text-xs text-slate-400 tabular-nums">
                                          Quantity:{' '}
                                          <span className="font-semibold text-yellow-400">{prize.quantity}</span>
                                       </p>
                                       <p className="text-xs text-slate-400 tabular-nums">
                                          Drawn:{' '}
                                          <span className="font-semibold text-yellow-400">
                                             {customers.filter((c) => c.prize_pool_id === prize.id).length}/
                                             {prize.quantity}
                                          </span>
                                       </p>
                                    </div>
                                 </div>
                                 <div className="p-4 pt-0 flex justify-end">
                                    <button
                                       onClick={() => requestDeletePrize(prize)}
                                       className="flex items-center gap-1.5 text-red-300 hover:text-red-200 text-xs font-semibold bg-red-950/60 border border-red-800 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                       <Trash2 className="w-3.5 h-3.5" /> Delete Prize
                                    </button>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               )}
            </>
         ) : (
            <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center text-slate-400">
               Select a category and event above to manage customers, check-in passes, and prize pools.
            </div>
         )}

         {/* Add Category Modal */}
         {categoryModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <form
                  onSubmit={handleCreateCategory}
                  className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4"
               >
                  <div className="flex items-center justify-between">
                     <h2 className="text-lg font-bold text-white">Add Category</h2>
                     <button
                        type="button"
                        onClick={() => setCategoryModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Category Name
                     </label>
                     <input
                        type="text"
                        required
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Year-End Gala 2026"
                        className={inputClass}
                     />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                     <button
                        type="button"
                        onClick={() => setCategoryModalOpen(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
                     >
                        Create Category
                     </button>
                  </div>
               </form>
            </div>
         )}

         {/* Add Event Modal */}
         {eventModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <form
                  onSubmit={handleCreateEvent}
                  className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4"
               >
                  <div className="flex items-center justify-between">
                     <h2 className="text-lg font-bold text-white">Add Event</h2>
                     <button
                        type="button"
                        onClick={() => setEventModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Event Title
                     </label>
                     <input
                        type="text"
                        required
                        autoFocus
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="e.g., Ho Chi Minh City Main Night"
                        className={inputClass}
                     />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                     <button
                        type="button"
                        onClick={() => setEventModalOpen(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
                     >
                        Create Event
                     </button>
                  </div>
               </form>
            </div>
         )}

         {/* Delete Prize Confirmation Modal */}
         {deletingPrize && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
                  <h2 className="text-lg font-bold text-white">Delete Prize Pool?</h2>
                  <p className="text-sm text-slate-300">
                     Are you sure you want to delete{' '}
                     <span className="font-semibold text-white">{deletingPrize.name}</span>? This action cannot be
                     undone.
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                     <button
                        type="button"
                        onClick={() => setDeletingPrize(null)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        onClick={confirmDeletePrize}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium"
                     >
                        Delete Prize
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Manual Prize Creation Modal */}
         {prizeModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 text-slate-100 shadow-2xl">
                  <h2 className="text-xl font-bold mb-4">Add New Prize Pool Item</h2>
                  <form onSubmit={handleCreateOrUpdatePrize} className="space-y-4">
                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                           Prize Name
                        </label>
                        <input
                           type="text"
                           required
                           autoFocus
                           value={prizeName}
                           onChange={(e) => setPrizeName(e.target.value)}
                           placeholder="e.g., iPhone 16 Pro"
                           className={inputClass}
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                           Image URL
                        </label>
                        <input
                           type="url"
                           value={prizeImageUrl}
                           onChange={(e) => setPrizeImageUrl(e.target.value)}
                           placeholder="https://example.com/image.png"
                           className={inputClass}
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                           Quantity
                        </label>
                        <input
                           type="number"
                           min={1}
                           value={prizeQuantity}
                           onChange={(e) => setPrizeQuantity(Number(e.target.value))}
                           className={inputClass}
                        />
                     </div>

                     <div className="flex justify-end gap-3 mt-6">
                        <button
                           type="button"
                           onClick={() => setPrizeModalOpen(false)}
                           className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
                        >
                           Save Prize
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Email Composition Modal */}
         {emailModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full p-6 text-slate-100 shadow-2xl">
                  <h2 className="text-xl font-bold mb-4 tabular-nums">
                     Send Pass Email ({selectedCustomers.length} recipients)
                  </h2>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                           Subject
                        </label>
                        <input
                           type="text"
                           value={emailSubject}
                           onChange={(e) => setEmailSubject(e.target.value)}
                           className={inputClass}
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                           Body Template
                        </label>
                        <textarea
                           rows={5}
                           value={emailBody}
                           onChange={(e) => setEmailBody(e.target.value)}
                           className={`${inputClass} font-sans`}
                        />
                        <p className="text-xs text-slate-400 mt-1">
                           Available tags: <code className="text-indigo-400">{'{{name}}'}</code>,{' '}
                           <code className="text-indigo-400">{'{{ticket}}'}</code>. QR Code is appended automatically.
                        </p>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                     <button
                        onClick={() => setEmailModalOpen(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSendEmails}
                        disabled={sendingEmail}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                     >
                        {sendingEmail ? 'Sending...' : 'Confirm & Dispatch'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Customer Modal */}
         {editingCustomer && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               <form
                  onSubmit={handleSaveCustomer}
                  className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4"
               >
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold">Edit Customer</h2>
                     <button
                        type="button"
                        onClick={() => setEditingCustomer(null)}
                        className="text-slate-400 hover:text-white"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Name
                     </label>
                     <input
                        type="text"
                        required
                        autoFocus
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className={inputClass}
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Email (read-only)
                     </label>
                     <input
                        type="email"
                        readOnly
                        value={editingCustomer.email}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-500 cursor-not-allowed"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Phone
                     </label>
                     <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className={inputClass}
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Ticket Code
                     </label>
                     <input
                        type="text"
                        required
                        value={editForm.ticket_code}
                        onChange={(e) => {
                           setLengthWarningLen(null);
                           setEditForm({ ...editForm, ticket_code: e.target.value });
                        }}
                        className={`${inputClass} font-mono tracking-wider`}
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Status
                     </label>
                     <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className={inputClass}
                     >
                        <option value="imported">Imported</option>
                        <option value="email_sent">Email Sent</option>
                        <option value="replied_scanned">Checked In (eligible for lucky draw)</option>
                     </select>
                  </div>

                  {lengthWarningLen !== null && (
                     <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-700 text-xs text-amber-200 space-y-2">
                        <p>
                           Other tickets in this event have <strong>{lengthWarningLen}</strong> characters. Different
                           lengths can misalign the lucky-draw reels.
                        </p>
                        <button
                           type="button"
                           onClick={persistCustomerEdit}
                           disabled={savingCustomer}
                           className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                        >
                           Save Anyway
                        </button>
                     </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                     <button
                        type="button"
                        onClick={() => setEditingCustomer(null)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        disabled={savingCustomer}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                     >
                        {savingCustomer ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
               </form>
            </div>
         )}
      </div>
   );
}
