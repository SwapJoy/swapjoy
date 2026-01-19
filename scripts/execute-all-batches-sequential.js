const fs = require('fs');

// Read all batch files
const batches = [];
for (let i = 1; i <= 9; i++) {
  const sql = fs.readFileSync(`/tmp/categories_batch_${i}.sql`, 'utf8');
  batches.push({ num: i, sql });
}

console.log(`Loaded ${batches.length} batches`);
batches.forEach(b => {
  const inserts = b.sql.match(/INSERT INTO/g);
  console.log(`Batch ${b.num}: ${inserts ? inserts.length : 0} INSERTs, ${b.sql.length} chars`);
});

// Output instructions
console.log('\n=== Execution Instructions ===');
console.log('Each batch SQL is ready in /tmp/categories_batch_N.sql');
console.log('Execute them sequentially via Supabase API using apply_migration');
console.log('\nBatch SQL files:');
batches.forEach(b => {
  console.log(`  Batch ${b.num}: /tmp/categories_batch_${b.num}.sql (${b.sql.length} chars)`);
});










