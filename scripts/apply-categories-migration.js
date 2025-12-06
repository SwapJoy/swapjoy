const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20251206211000_seed_categories_from_json.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log(`Migration file read: ${(sql.length / 1024).toFixed(2)}KB`);
console.log(`Total INSERT statements: ${(sql.match(/INSERT INTO/g) || []).length}`);
console.log('\nMigration content ready. This needs to be executed via Supabase MCP tools.');
console.log('The migration is idempotent (uses ON CONFLICT DO NOTHING), so it\'s safe to run.');

// Note: This script just validates the file. The actual execution needs to happen via MCP tools
// or Supabase CLI: supabase db push
