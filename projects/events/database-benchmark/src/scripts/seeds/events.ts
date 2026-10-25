import * as fs from 'fs';
import { faker } from '@faker-js/faker';

import { supabase } from '../../lib/supabase';

const TARGET_RECORDS = 10000;
const CSV_FILENAME = 'src/assets/seeds/events.csv';

async function generateEventsCSV() {
   console.log('Fetching existing companies...');
   const { data: companies, error } = await supabase.from('companies').select('id');

   if (error || !companies?.length) {
      console.error('Error fetching companies or no companies found:', error);
      return;
   }

   const companyIds = companies.map((c) => c.id);

   console.log(`Found ${companyIds.length} companies. Generating ${TARGET_RECORDS} events...`);
   const stream = fs.createWriteStream(CSV_FILENAME);

   // CSV Header
   stream.write(
      'company_id,name,slug,description,location_name,location_address,start_time,end_time,banner_url,status\n',
   );

   for (let i = 0; i < TARGET_RECORDS; i++) {
      const company_id = faker.helpers.arrayElement(companyIds);
      const name = faker.company.catchPhrase();
      // Ensure unique slug
      const slug = faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(6);
      const description = faker.lorem.paragraph();
      const location_name = faker.location.buildingNumber() + ' ' + faker.location.street();
      const location_address = faker.location.streetAddress({ useFullAddress: true });

      // Dates (Start time in the future, end time a few hours/days later)
      const start_time = faker.date.soon({ days: 60 }).toISOString();
      const end_time = faker.date.future({ years: 1, refDate: start_time }).toISOString();

      const banner_url = faker.image.url();
      const status = faker.helpers.arrayElement(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']);

      // Escape commas and quotes for CSV safety
      const safeName = `"${name.replace(/"/g, '""')}"`;
      const safeDesc = `"${description.replace(/"/g, '""')}"`;
      const safeLocName = `"${location_name.replace(/"/g, '""')}"`;
      const safeLocAddr = `"${location_address.replace(/"/g, '""')}"`;

      stream.write(
         `${company_id},${safeName},${slug},${safeDesc},${safeLocName},${safeLocAddr},${start_time},${end_time},${banner_url},${status}\n`,
      );
   }

   stream.end();
   console.log(`✅ Successfully generated ${CSV_FILENAME}. Please import this via the Supabase Dashboard.`);
}

generateEventsCSV();
