const fs = require('fs');

// Read the SQL file
const sql = fs.readFileSync('supabase/migrations/20251206211000_seed_categories_from_json.sql', 'utf8');

// Split by INSERT statements, keeping BEGIN and COMMIT
const lines = sql.split('\n');
const batches = [];
let currentBatch = [];
let inTransaction = false;

for (const line of lines) {
  if (line.trim() === 'BEGIN;') {
    inTransaction = true;
    currentBatch.push(line);
  } else if (line.trim() === 'COMMIT;') {
    currentBatch.push(line);
    if (currentBatch.length > 0) {
      batches.push(currentBatch.join('\n'));
    }
    currentBatch = [];
    inTransaction = false;
  } else if (inTransaction && line.trim().startsWith('INSERT INTO')) {
    currentBatch.push(line);
    // Create batches of ~200 INSERTs each
    if (currentBatch.filter(l => l.trim().startsWith('INSERT INTO')).length >= 200) {
      // Don't add COMMIT yet, we'll add it at the end
      const inserts = currentBatch.filter(l => l.trim().startsWith('INSERT INTO'));
      const batchSql = ['BEGIN;', ...inserts, 'COMMIT;'].join('\n');
      batches.push(batchSql);
      currentBatch = [];
    }
  } else if (inTransaction) {
    currentBatch.push(line);
  }
}

// Add remaining
if (currentBatch.length > 0) {
  const inserts = currentBatch.filter(l => l.trim().startsWith('INSERT INTO'));
  if (inserts.length > 0) {
    const batchSql = ['BEGIN;', ...inserts, 'COMMIT;'].join('\n');
    batches.push(batchSql);
  }
}

console.log(`Total batches: ${batches.length}`);
console.log(`First batch (first 500 chars):\n${batches[0].substring(0, 500)}...`);
console.log(`\nLast batch (last 200 chars):\n...${batches[batches.length - 1].substring(batches[batches.length - 1].length - 200)}`);

// Write batches to files for manual execution or API calls
batches.forEach((batch, idx) => {
  fs.writeFileSync(`/tmp/categories_batch_${idx + 1}.sql`, batch);
});

console.log(`\nBatches written to /tmp/categories_batch_*.sql`);
console.log(`You can execute them sequentially via Supabase API or CLI`);

