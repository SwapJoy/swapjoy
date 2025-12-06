const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read the SQL file
const sql = fs.readFileSync('supabase/migrations/20251206211000_seed_categories_from_json.sql', 'utf8');

// Supabase configuration
const supabaseUrl = 'https://glbvyusqksnoyjuztceo.supabase.co';
// Note: You'll need to set SUPABASE_SERVICE_ROLE_KEY environment variable
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.error('Please set it before running this script:');
  console.error('export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Applying migration...');
    console.log(`SQL file size: ${sql.length} characters`);
    
    // Execute the SQL using RPC or direct query
    // Note: Supabase JS client doesn't have a direct SQL execution method
    // We'll need to use the REST API or PostgREST
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql_query: sql })
    });
    
    if (!response.ok) {
      // Try alternative: execute via PostgREST
      console.log('Trying alternative method...');
      // For now, we'll output the SQL so it can be run manually
      console.log('\n=== SQL to execute ===\n');
      console.log(sql.substring(0, 1000) + '...\n');
      console.log('File is too large to execute via API.');
      console.log('Please run this SQL in the Supabase SQL Editor or via psql.');
    } else {
      const result = await response.json();
      console.log('Migration applied successfully!', result);
    }
  } catch (error) {
    console.error('Error applying migration:', error.message);
    console.log('\nThe migration file is ready at:');
    console.log('supabase/migrations/20251206211000_seed_categories_from_json.sql');
    console.log('\nYou can apply it via:');
    console.log('1. Supabase Dashboard SQL Editor');
    console.log('2. Supabase CLI: supabase db push');
    console.log('3. psql: psql $DATABASE_URL < supabase/migrations/20251206211000_seed_categories_from_json.sql');
  }
}

applyMigration();

