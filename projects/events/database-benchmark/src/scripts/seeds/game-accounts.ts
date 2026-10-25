import * as fs from 'fs';
import { faker } from '@faker-js/faker';

import { supabase } from '../../lib/supabase';

const TARGET_RECORDS = 30000;
const CSV_FILENAME = 'src/assets/seeds/game_accounts.csv';

async function generateGameAccountsCSV() {
   console.log('Fetching existing staff/guards and games...');

   // 1. Fetch Staff & Guards
   const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .in('role', ['FIELD_STAFF', 'GUARD'])
      .limit(10000);

   // 2. Fetch Games (including their parent event_id)
   const { data: games } = await supabase.from('games').select('id, event_id').limit(10000);

   console.log(`Fetched ${accounts?.length || 0} staff/guards and ${games?.length || 0} games.`);

   if (!accounts?.length || !games?.length) {
      console.error('Missing prerequisites! Ensure accounts and games tables are seeded.');
      return;
   }

   const accountIds = accounts.map((a) => a.id);

   console.log(
      `Found ${accountIds.length} staff and ${games.length} games. Generating ${TARGET_RECORDS} assignments...`,
   );
   const stream = fs.createWriteStream(CSV_FILENAME);

   stream.write('game_id,event_id,account_id,assigned_at\n');

   for (let i = 0; i < TARGET_RECORDS; i++) {
      const game = faker.helpers.arrayElement(games);
      const account_id = faker.helpers.arrayElement(accountIds);
      const assigned_at = faker.date.recent({ days: 30 }).toISOString();

      stream.write(`${game.id},${game.event_id},${account_id},${assigned_at}\n`);
   }

   stream.end();
   stream.on('finish', () => {
      console.log(`✅ Successfully generated ${CSV_FILENAME}. Import via Supabase Dashboard.`);
   });
}

generateGameAccountsCSV();
