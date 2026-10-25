import * as fs from 'fs';
import * as crypto from 'crypto';

const NUM_ROWS = 100;
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Entertainment', 'Retail'];
const CSV_FILE = 'src/assets/seeds/companies.csv';

const stream = fs.createWriteStream(CSV_FILE);

// Write CSV Header
// Note: We do NOT include search_text because PostgreSQL generates it automatically.
stream.write(
   'id,name,tax_code,industry,contact_person,contact_email,contact_phone,address,logo_url,status,created_at,updated_at\n',
);

for (let i = 1; i <= NUM_ROWS; i++) {
   const id = crypto.randomUUID();
   const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
   const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];

   const name = `Test Company ${i} LLC`;
   const taxCode = `TAX${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
   const contactPerson = `Director ${i}`;
   const contactEmail = `hello${i}@testcompany${i}.com`;
   const contactPhone = `+1800${String(i).padStart(7, '0')}`;

   // We wrap the address in double quotes because it contains a comma,
   // which would otherwise break the CSV columns.
   const address = `"${i}00 Business Parkway, Suite ${i}"`;
   const logoUrl = `https://example.com/logos/company-${i}.png`;

   // Write row data
   stream.write(
      `${id},${name},${taxCode},${industry},${contactPerson},${contactEmail},${contactPhone},${address},${logoUrl},${status},2024-01-01T00:00:00Z,2024-01-01T00:00:00Z\n`,
   );
}

stream.end();
stream.on('finish', () => {
   console.log(`✅ Successfully generated ${CSV_FILE} with ${NUM_ROWS} rows.`);
   console.log(`➡️  Next step: Open Supabase Table Editor -> companies -> Insert -> Import data from CSV.`);
});
