const fs = require('fs');
const path = require('path');

// Read and execute each batch file
const batchFiles = [];
for (let i = 1; i <= 9; i++) {
  batchFiles.push(`/tmp/categories_batch_${i}.sql`);
}

console.log(`Found ${batchFiles.length} batch files to execute.`);

// For each batch, read the file and log its size
batchFiles.forEach((filePath, index) => {
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const sizeKB = (sqlContent.length / 1024).toFixed(2);
    const insertCount = (sqlContent.match(/INSERT INTO/g) || []).length;
    console.log(`Batch ${index + 1}: ${path.basename(filePath)} - ${sizeKB}KB, ${insertCount} INSERT statements`);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
});

console.log('\nBatch files are ready. Execute them using the MCP execute_sql tool.');
