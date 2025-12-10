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

// Output the SQL for each batch
console.log('\n=== Batch SQL Content ===');
batches.forEach(b => {
  console.log(`\n--- Batch ${b.num} ---`);
  console.log(b.sql.substring(0, 200) + '...');
  console.log(`(Full SQL: ${b.sql.length} chars)`);
});


