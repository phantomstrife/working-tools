import * as fs from 'fs';
import * as crypto from 'crypto';

const NUM_ROWS = 50000;
const ROLES = ['SUPER_ADMIN', 'ADMIN', 'FIELD_STAFF', 'GUARD'];
const CSV_FILE = 'src/assets/seeds/accounts.csv';

const stream = fs.createWriteStream(CSV_FILE);

// Write CSV Header
stream.write('id,email,username,password_hash,full_name,phone,role,is_active,created_at,updated_at\n');

for (let i = 1; i <= NUM_ROWS; i++) {
   const id = crypto.randomUUID();
   const role = ROLES[Math.floor(Math.random() * ROLES.length)];
   const email = `testuser${i}_${crypto.randomBytes(4).toString('hex')}@example.com`;
   const username = `tester${i}`;
   const fullName = `Test User ${i}`;
   const phone = `+1555${String(i).padStart(7, '0')}`;

   // Minimal static data for the rest to speed up generation
   stream.write(
      `${id},${email},${username},mock_hash,${fullName},${phone},${role},true,2024-01-01T00:00:00Z,2024-01-01T00:00:00Z\n`,
   );
}

stream.end();
stream.on('finish', () => {
   console.log(`✅ Successfully generated ${CSV_FILE} with ${NUM_ROWS} rows.`);
   console.log(`➡️  Next step: Open Supabase Table Editor -> accounts -> Insert -> Import data from CSV.`);
});
