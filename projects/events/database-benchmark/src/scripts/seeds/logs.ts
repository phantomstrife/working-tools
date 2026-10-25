import * as fs from 'fs';
import { faker } from '@faker-js/faker';

import { supabase } from '../../lib/supabase';

const TARGET_RECORDS = 50000;
const CSV_FILENAME = 'src/assets/seeds/logs.csv';

async function generateLogsCSV() {
   console.log('Fetching accounts and games...');

   const { data: accounts } = await supabase.from('accounts').select('id').limit(10000);
   const { data: games } = await supabase.from('games').select('id, event_id').limit(10000);

   if (!accounts?.length || !games?.length) {
      console.error('Missing prerequisites! Ensure accounts and games tables are seeded.');
      return;
   }

   console.log(`Generating ${TARGET_RECORDS} audit logs...`);
   const stream = fs.createWriteStream(CSV_FILENAME);

   stream.write('account_id,event_id,game_id,action_type,target_entity,target_id,metadata,created_at\n');

   const actionTypes = [
      'EMAIL_BATCH_SEND',
      'CHECKIN_QR_SCAN',
      'CHECKIN_MANUAL_SEARCH',
      'PRIZE_DRAWN',
      //
   ];

   for (let i = 0; i < TARGET_RECORDS; i++) {
      const account = faker.helpers.arrayElement(accounts);
      const game = faker.helpers.arrayElement(games);
      const action = faker.helpers.arrayElement(actionTypes);

      // Simulate target entities
      const isEventAction = action === 'CHECKIN_QR_SCAN' || action === 'PRIZE_DRAWN';
      const target_entity = isEventAction ? 'lucky_draw_attendants' : 'accounts';
      const target_id = faker.string.uuid();

      const metadata = `"{""ip_address"": ""${faker.internet.ipv4()}"", ""browser"": ""Chrome""}"`;
      const created_at = faker.date.recent({ days: 10 }).toISOString();

      stream.write(
         `${account.id},${game.event_id},${game.id},${action},${target_entity},${target_id},${metadata},${created_at}\n`,
      );
   }

   stream.end();
   stream.on('finish', () => {
      console.log(`✅ Successfully generated ${CSV_FILENAME}. Import via Supabase Dashboard.`);
   });
}

generateLogsCSV();
