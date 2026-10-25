import * as fs from 'fs';
import { faker } from '@faker-js/faker';

import { supabase } from '../../lib/supabase';

const CSV_FILENAME = 'src/assets/seeds/lucky_draw_prizes.csv';

async function generateLDPrizesCSV() {
   console.log('Fetching existing games...');
   const { data: games } = await supabase.from('games').select('id').limit(20000);

   if (!games?.length) {
      console.error('Missing prerequisites! Ensure the games table is seeded.');
      return;
   }

   const PRIZES_PER_GAME = 10;
   console.log(`Found ${games.length} games. Generating ${games.length * PRIZES_PER_GAME} prizes...`);

   const stream = fs.createWriteStream(CSV_FILENAME);
   stream.write('game_id,name,description,image_url,tier_order,total_quantity,remaining_quantity\n');

   for (const game of games) {
      for (let tier = 1; tier <= PRIZES_PER_GAME; tier++) {
         const name = `${tier === 1 ? '1st' : tier === 2 ? '2nd' : '3rd'} Prize - ${faker.commerce.productName()}`;
         const description = faker.lorem.sentence();
         const image_url = faker.image.url();

         // Tier 1 gets 1 winner, Tier 2 gets 2 winners, etc.
         const quantity = tier;

         const safeName = `"${name.replace(/"/g, '""')}"`;
         const safeDesc = `"${description.replace(/"/g, '""')}"`;

         stream.write(`${game.id},${safeName},${safeDesc},${image_url},${tier},${quantity},${quantity}\n`);
      }
   }

   stream.end();
   stream.on('finish', () => {
      console.log(`✅ Successfully generated ${CSV_FILENAME}. Import via Supabase Dashboard.`);
   });
}

generateLDPrizesCSV();
