import * as fs from 'fs';
import * as crypto from 'crypto';
import { faker } from '@faker-js/faker';

import { supabase } from '../../lib/supabase';

const TARGET_RECORDS = 10000;
const CSV_FILENAME = 'src/assets/seeds/lucky_draw_attendants.csv';

async function generateLDAttendantsCSV() {
   console.log('Fetching existing games...');
   const { data: games } = await supabase.from('games').select('id').limit(10000);

   if (!games?.length) {
      console.error('Missing prerequisites! Ensure the games table is seeded.');
      return;
   }

   console.log(`Found ${games.length} games. Generating ${TARGET_RECORDS} attendants...`);
   const stream = fs.createWriteStream(CSV_FILENAME);

   // CSV Header
   stream.write('game_id,full_name,email,phone,ticket_code,company_name,department,qr_code_payload,is_checked_in\n');

   for (let i = 0; i < TARGET_RECORDS; i++) {
      const game = faker.helpers.arrayElement(games);

      const full_name = faker.person.fullName();
      const email = faker.internet.email({ firstName: full_name.split(' ')[0] });
      const phone = faker.phone.number();

      // Guaranteed unique ticket code per game
      const ticket_code = `TKT-${i}-${faker.string.alphanumeric(4).toUpperCase()}`;
      const company_name = faker.company.name();
      const department = faker.commerce.department();

      // Generate a secure payload hash for the QR code
      const qr_code_payload = crypto
         .createHash('sha256')
         .update(`${game.id}-${ticket_code}-${Date.now()}`)
         .digest('hex');

      // Simulate ~40% of people having already checked in via the Guard App
      const is_checked_in = faker.datatype.boolean(0.4);

      const safeName = `"${full_name.replace(/"/g, '""')}"`;
      const safeComp = `"${company_name.replace(/"/g, '""')}"`;

      stream.write(
         `${game.id},${safeName},${email},${phone},${ticket_code},${safeComp},${department},${qr_code_payload},${is_checked_in}\n`,
      );
   }

   stream.end();
   stream.on('finish', () => {
      console.log(`✅ Successfully generated ${CSV_FILENAME}. Import via Supabase Dashboard.`);
   });
}

generateLDAttendantsCSV();
