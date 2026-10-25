import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const RUNS = 5;

// Configuration for each table to test them accurately
const TABLE_CONFIGS = {
   accounts: {
      searchTerm: 'Test User 49',
      selectColumns: 'id, full_name, email, role, is_active, created_at',
   },
   companies: {
      searchTerm: 'Test Company 49 LLC',
      selectColumns: 'id, name, tax_code, status, created_at',
   },
   events: {
      searchTerm: 'generation',
      selectColumns: 'id, name, slug, location_name, status, start_time',
   },
   games: {
      searchTerm: 'Frozen',
      selectColumns: 'id, event_id, name, description, game_type, status, created_at',
   },
   game_accounts: {
      searchTerm: '58145b8e-e6eb-4502-8ac1-85d475201d3c',
      selectColumns: 'id, game_id, event_id, account_id, assigned_at',
   },
   logs: {
      searchTerm: 'lucky_draw',
      selectColumns: 'id, account_id, action_type, target_entity, created_at',
   },
   lucky_draw_prizes: {
      searchTerm: 'Prize',
      selectColumns: 'id, game_id, name, total_quantity, remaining_quantity',
   },
   lucky_draw_attendants: {
      searchTerm: 'TKT-150',
      selectColumns: 'id, game_id, full_name, email, ticket_code, is_checked_in, has_won',
   },
   lucky_draw_winners: {
      searchTerm: '5925a12b-d588-4bfb-aa1b-3c6ab38abe54',
      selectColumns: 'id, game_id, prize_id, attendant_id, won_at',
   },
};

async function runBenchmark(tableName: keyof typeof TABLE_CONFIGS) {
   const config = TABLE_CONFIGS[tableName];

   if (!config) {
      console.error(`❌ Error: No configuration found for table '${tableName}'.`);
      return;
   }

   console.log(`\n🚀 Running Benchmark on [${tableName}] (${RUNS} queries)...\n`);
   const times: number[] = [];

   for (let i = 1; i <= RUNS; i++) {
      const start = performance.now();

      let query = supabase
         .from(tableName)
         .select(config.selectColumns, { count: 'estimated' })
         .order(tableName === 'lucky_draw_winners' ? 'won_at' : 'created_at', { ascending: false })
         .range(0, 19);

      if (tableName === 'game_accounts') {
         query = query.eq('account_id', config.searchTerm);
      } else if (tableName === 'lucky_draw_winners') {
         query = query.eq('game_id', config.searchTerm);
      } else if (tableName === 'lucky_draw_attendants') {
         query = query.ilike('search_text', `%${config.searchTerm}%`);
      } else {
         query = query.ilike('search_text', `%${config.searchTerm}%`);
      }

      const { count, error } = await query;

      const end = performance.now();

      if (error) {
         console.error(`Query Failed on ${tableName}:`, error.message);
         return;
      }

      const duration = end - start;
      times.push(duration);
      console.log(`Run ${i}: ${duration.toFixed(2)}ms (Found ${count} matches)`);
   }

   const avg = times.reduce((a, b) => a + b, 0) / times.length;
   console.log(`\n📊 [${tableName}] Average: ${avg.toFixed(2)}ms\n`);
}

const targetTable = process.argv[2] as keyof typeof TABLE_CONFIGS | undefined;

if (targetTable) {
   runBenchmark(targetTable);
} else {
   console.log('No specific table provided. Running all benchmarks...\n');
   (async () => {
      await runBenchmark('accounts');
      await runBenchmark('companies');
      await runBenchmark('events');
      await runBenchmark('games');
      await runBenchmark('game_accounts');
      await runBenchmark('logs');
      await runBenchmark('lucky_draw_prizes');
      await runBenchmark('lucky_draw_attendants');
      await runBenchmark('lucky_draw_winners');
   })();
}
