import { query } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function init() {
  const statements = schema.split(';').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await query(stmt);
  }
  console.log('✅ Database schema initialized.');
}

init().catch((err) => {
  console.error('❌ Init failed:', err.message);
  process.exit(1);
});
