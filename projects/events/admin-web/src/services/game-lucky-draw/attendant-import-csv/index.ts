'use server';

import { verifyGameAccess } from '@admin-web/services/game-lucky-draw/verify-game-access';
import { parseCsv } from '@admin-web/utilities/csv';
import { generateQrCodePayload } from '@admin-web/utilities/qr-code';
import { trycatchAsync } from '@admin-web/utilities/trycatch';

import { BATCH_CHUNK_SIZE, EMAIL_REGEX, FETCH_PAGE_SIZE, STANDARD_CSV_COLUMNS } from './constants';

import type * as Types from './type';

const normalizeHeaderKey = (header: string): string => {
   return header
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
};

export const useServicesGameLuckyDrawAttendantImportCsv: Types.Service = async (request) => {
   return trycatchAsync(async () => {
      const access = await verifyGameAccess({ gameId: request.gameId });

      if (access.error) {
         throw new Error(access.message);
      }

      const { supabase } = access.data;
      const parsed = parseCsv(request.csvContent);

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
         throw new Error('services.game_lucky_draw.attendant.csv_empty');
      }

      const headerMap = new Map<string, string>();
      parsed.headers.forEach((rawHeader) => {
         headerMap.set(rawHeader, normalizeHeaderKey(rawHeader));
      });

      const normalizedHeaders = new Set(headerMap.values());
      if (!normalizedHeaders.has('full_name') || !normalizedHeaders.has('ticket_code')) {
         throw new Error('services.game_lucky_draw.attendant.csv_missing_headers');
      }

      const standardKeysSet = new Set<string>(STANDARD_CSV_COLUMNS);

      const existingMap = new Map<
         string,
         {
            id: string;
            ticket_code: string;
            email: string | null;
            qr_code_payload: string;
         }
      >();

      let offset = 0;
      while (true) {
         const batch = await supabase
            .from('lucky_draw_attendants')
            .select('id, ticket_code, email, qr_code_payload')
            .eq('game_id', request.gameId)
            .range(offset, offset + FETCH_PAGE_SIZE - 1);

         if (batch.error) {
            throw new Error(batch.error.message);
         }

         const items = batch.data ?? [];
         items.forEach((item) => {
            existingMap.set(item.ticket_code.toLowerCase(), item);
         });

         if (items.length < FETCH_PAGE_SIZE) {
            break;
         }

         offset += FETCH_PAGE_SIZE;
      }

      const seenInFile = new Set<string>();
      const toInsert: AdminWeb.Database.GameLuckyDrawAttendantInsert[] = [];
      const toUpdate: AdminWeb.Database.GameLuckyDrawAttendantInsert[] = [];
      const errors: Types.RowError[] = [];

      parsed.rows.forEach((rawRow, index) => {
         const rowNumber = index + 2;
         const normalizedRow: Record<string, string> = {};
         const customMetadata: Record<string, string> = {};

         Object.entries(rawRow).forEach(([rawHeader, cellValue]) => {
            const normalizedKey = headerMap.get(rawHeader) ?? normalizeHeaderKey(rawHeader);
            const trimmedValue = cellValue.trim();

            if (standardKeysSet.has(normalizedKey)) {
               normalizedRow[normalizedKey] = trimmedValue;
            } else if (trimmedValue !== '') {
               customMetadata[rawHeader.trim()] = trimmedValue;
            }
         });

         const fullName = normalizedRow.full_name ?? '';
         const ticketCode = normalizedRow.ticket_code ?? '';
         const email = normalizedRow.email ?? '';
         const phone = normalizedRow.phone ?? '';
         const companyName = normalizedRow.company_name ?? '';
         const department = normalizedRow.department ?? '';

         if (!fullName || !ticketCode) {
            errors.push({
               row: rowNumber,
               ticket_code: ticketCode || undefined,
               reason: 'missing_required_fields',
            });
            return;
         }

         if (email && !EMAIL_REGEX.test(email)) {
            errors.push({
               row: rowNumber,
               ticket_code: ticketCode,
               reason: 'invalid_email',
            });
            return;
         }

         const ticketLookupKey = ticketCode.toLowerCase();

         if (seenInFile.has(ticketLookupKey)) {
            errors.push({
               row: rowNumber,
               ticket_code: ticketCode,
               reason: 'duplicate_in_file',
            });
            return;
         }

         seenInFile.add(ticketLookupKey);

         const hasCustomMetadata = Object.keys(customMetadata).length > 0;
         const existing = existingMap.get(ticketLookupKey);

         if (existing) {
            const nextEmail = email || null;
            const emailChanged = (existing.email ?? null) !== nextEmail;

            toUpdate.push({
               id: existing.id,
               game_id: request.gameId,
               full_name: fullName,
               ticket_code: existing.ticket_code,
               qr_code_payload: existing.qr_code_payload,
               email: nextEmail,
               phone: phone || null,
               company_name: companyName || null,
               department: department || null,
               ...(hasCustomMetadata ? { custom_metadata: customMetadata } : {}),
               ...(emailChanged ? { email_status: 'NOT_SENT', email_sent_at: null } : {}),
               updated_at: new Date().toISOString(),
            });
            return;
         }

         toInsert.push({
            game_id: request.gameId,
            full_name: fullName,
            ticket_code: ticketCode,
            qr_code_payload: generateQrCodePayload(request.gameId, ticketCode),
            email: email || null,
            phone: phone || null,
            company_name: companyName || null,
            department: department || null,
            custom_metadata: hasCustomMetadata ? customMetadata : null,
            email_status: 'NOT_SENT',
            is_checked_in: false,
            has_won: false,
         });
      });

      for (let i = 0; i < toInsert.length; i += BATCH_CHUNK_SIZE) {
         const chunk = toInsert.slice(i, i + BATCH_CHUNK_SIZE);
         const insertResult = await supabase.from('lucky_draw_attendants').insert(chunk);

         if (insertResult.error) {
            throw new Error(insertResult.error.message);
         }
      }

      for (let i = 0; i < toUpdate.length; i += BATCH_CHUNK_SIZE) {
         const chunk = toUpdate.slice(i, i + BATCH_CHUNK_SIZE);
         const updateResult = await supabase.from('lucky_draw_attendants').upsert(chunk, {
            onConflict: 'id',
         });

         if (updateResult.error) {
            throw new Error(updateResult.error.message);
         }
      }

      return {
         totalRows: parsed.rows.length,
         insertedCount: toInsert.length,
         updatedCount: toUpdate.length,
         skippedCount: errors.length,
         errors,
      };
   });
};

