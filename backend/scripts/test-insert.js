import { query } from '../src/config/db.js';
import bcrypt from 'bcryptjs';

try {
  const hash = await bcrypt.hash('Password123!', 10);
  console.log('Inserting student...');
  const result = await query('INSERT INTO students (user_id, student_id, faculty, department, semester, eligibility_status) VALUES (?, ?, ?, ?, ?, ?)', [hash, 'TEST001', 'Engineering', 'CS', '3rd Sem', 'eligible']);
  console.log('Insert result:', JSON.stringify(result));
  
  const [rows] = await query('SELECT * FROM students');
  console.log('Total students after insert:', rows.length);
  console.log('Rows:', JSON.stringify(rows));
} catch (err) {
  console.error('ERROR:', err.message);
}
