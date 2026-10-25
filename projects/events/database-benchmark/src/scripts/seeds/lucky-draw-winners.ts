import * as fs from 'fs';
import { supabase } from '../../lib/supabase';

const TARGET_RECORDS = 10000;
const CSV_FILENAME = 'src/assets/seeds/lucky_draw_winners.csv';

async function generateLDWinnersCSV() {
   console.log('Fetching prizes and matching attendants...');

   // 1. Fetch a batch of prizes
   const { data: prizes } = await supabase.from('lucky_draw_prizes').select('id, game_id').limit(TARGET_RECORDS);

   if (!prizes?.length) {
      return console.error('No prizes found.');
   }

   // 2. Extract unique game_ids to fetch only the attendants we actually need
   const uniqueGameIds = Array.from(new Set(prizes.map((p) => p.game_id)));

   // 3. Fetch attendants for ALL these games in one single API request (Fixing the N+1 query problem)
   const { data: allAttendants, error } = await supabase
      .from('lucky_draw_attendants')
      .select('id, game_id')
      .in('game_id', uniqueGameIds)
      .limit(10000); // Adjust limit if you have a massive pool

   if (error || !allAttendants) {
      return console.error('Failed to fetch attendants:', error);
   }

   // 4. Group the attendants by game_id in memory for instant O(1) lookups
   const attendantsByGame = new Map<string, string[]>();
   for (const att of allAttendants) {
      if (!attendantsByGame.has(att.game_id)) {
         attendantsByGame.set(att.game_id, []);
      }
      attendantsByGame.get(att.game_id)!.push(att.id);
   }

   const stream = fs.createWriteStream(CSV_FILENAME);
   stream.write('game_id,prize_id,attendant_id,won_at\n');

   let successCount = 0;

   // 5. Loop through prizes and match them instantly in memory
   for (const prize of prizes) {
      const gameAttendants = attendantsByGame.get(prize.game_id);

      // If this game has available attendants
      if (gameAttendants && gameAttendants.length > 0) {
         // .pop() removes the attendant from the array so they can't win twice in the same game!
         const winnerId = gameAttendants.pop();
         const won_at = new Date().toISOString();

         stream.write(`${prize.game_id},${prize.id},${winnerId},${won_at}\n`);
         successCount++;
      }

      if (successCount % 100 === 0) {
         console.log(`Processed prize ${prize.id}. Total winners so far: ${successCount}`);
      }
   }

   stream.end();
   stream.on('finish', () => {
      console.log(`✅ Successfully generated ${CSV_FILENAME} with ${successCount} winners.`);
   });
}

generateLDWinnersCSV();
