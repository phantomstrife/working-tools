import * as fs from 'fs';
import { faker } from '@faker-js/faker';

import { supabase } from '../../lib/supabase';

const TARGET_RECORDS = 500; // Adjust as needed
const CSV_FILENAME = 'src/assets/seeds/games.csv';

async function generateGamesCSV() {
   console.log('Fetching existing events...');
   // Fetch up to 100,000 event IDs to ensure we have a good pool
   const { data: events, error } = await supabase.from('events').select('id').limit(100000);

   if (error || !events?.length) {
      console.error('Error fetching events or no events found:', error);
      return;
   }

   const eventIds = events.map((e) => e.id);

   console.log(`Found ${eventIds.length} events. Generating ${TARGET_RECORDS} games...`);
   const stream = fs.createWriteStream(CSV_FILENAME);

   // CSV Header
   stream.write('event_id,name,description,game_type,config,is_dev_only,status\n');

   for (let i = 0; i < TARGET_RECORDS; i++) {
      const event_id = faker.helpers.arrayElement(eventIds);
      const name = `Lucky Draw: ${faker.commerce.productAdjective()} Edition`;
      const description = faker.lorem.sentence();
      const game_type = 'LUCKY_DRAW'; // Currently the only ENUM value we have

      // Using a minimal, safe JSON object for the CSV import
      const config = `"{""theme"": ""${faker.color.human()}""}"`;

      const is_dev_only = faker.datatype.boolean(0.1); // 10% chance to be true
      const status = faker.helpers.arrayElement(['PENDING', 'READY', 'LIVE', 'FINISHED']);

      // Escape commas and quotes for CSV safety
      const safeName = `"${name.replace(/"/g, '""')}"`;
      const safeDesc = `"${description.replace(/"/g, '""')}"`;

      stream.write(`${event_id},${safeName},${safeDesc},${game_type},${config},${is_dev_only},${status}\n`);
   }

   stream.end();
   stream.on('finish', () => {
      console.log(`✅ Successfully generated ${CSV_FILENAME}. Please import this via the Supabase Dashboard.`);
   });
}

generateGamesCSV();
