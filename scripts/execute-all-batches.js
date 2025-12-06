const fs = require('fs');

async function executeBatches() {
  const batchFiles = [];
  for (let i = 1; i <= 9; i++) {
    batchFiles.push(`/tmp/categories_batch_${i}.sql`);
  }

  console.log(`Executing ${batchFiles.length} batches sequentially...\n`);

  for (let i = 0; i < batchFiles.length; i++) {
    const filePath = batchFiles[i];
    try {
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const insertCount = (sqlContent.match(/INSERT INTO/g) || []).length;
      console.log(`Batch ${i + 1}: ${insertCount} INSERT statements (${sqlContent.length} chars)`);
      console.log(`SQL content ready for batch ${i + 1}`);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      throw error;
    }
  }
  
  console.log('\nAll batch files read successfully. Ready for execution.');
}

executeBatches();
