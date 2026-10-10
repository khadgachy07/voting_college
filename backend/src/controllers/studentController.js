import { query } from '../config/db.js';
import { signToken } from '../utils/jwt.js';

async function findUserByStudentId(studentId) {
  const [student] = await query('SELECT * FROM students WHERE student_id = ?', [studentId]);
  if (!student) return null;
  const [user] = await query('SELECT * FROM users WHERE id = ?', [student.user_id]);
  return user ? student : null;
}

export async function listStudents(req, res) {
  const { department, semester, search } = req.query;
  let sql = 'SELECT s.*, u.role FROM students s JOIN users u ON s.user_id = u.id';
  const params = [];

  if (department) {
    sql += ' WHERE s.department = ?';
    params.push(department);
  }
  if (semester) {
    sql += ' AND s.semester = ?';
    params.push(semester);
  }
  if (search) {
    sql += ' AND (s.student_id LIKE ? OR s.name_placeholder LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const rows = await query(sql, params);
  res.json({ students: rows });
}

export async function getStudent(req, res) {
  const { id } = req.params;
  const [student] = await query('SELECT * FROM students WHERE id = ?', [id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ student });
}

export async function createStudent(req, res) {
  const { name, student_id, faculty, department, semester, batch, password, eligibility_status } = req.body;
  if (!name || !student_id) {
    return res.status(400).json({ message: 'name and student_id are required' });
  }

  const hash = await bcryptHash(password);
  const result = await query(
    'INSERT INTO students (user_id, student_id, faculty, department, semester, batch, eligibility_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [hash, student_id, faculty, department, semester, batch, eligibility_status || 'eligible']
  );

  const token = signToken({ id: result.insertId, role: 'student' });
  res.status(201).json({ message: 'Student created', student_id: result.insertId, token });
}

export async function updateStudent(req, res) {
  const { id } = req.params;
  const fields = req.body;
  delete fields.id;

  if (!fields.student_id && !fields.faculty && !fields.department && !fields.semester && !fields.batch && !fields.eligibility_status) {
    return res.status(400).json({ message: 'Nothing to update' });
  }

  const [student] = await query('SELECT * FROM students WHERE id = ?', [id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  if (fields.password) fields.password_hash = await bcryptHash(fields.password);
  else delete fields.password_hash;

  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const params = [...keys.map((k) => fields[k]), id];

  await query(`UPDATE students SET ${setClause} WHERE id = ?`, params);
  res.json({ message: 'Student updated', student });
}

export async function deleteStudent(req, res) {
  const { id } = req.params;
  const [student] = await query('SELECT * FROM students WHERE id = ?', [id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  await query('DELETE FROM students WHERE id = ?', [id]);
  res.json({ message: 'Student deleted' });
}

export async function toggleEligibility(req, res) {
  const { id } = req.params;
  const [student] = await query('SELECT * FROM students WHERE id = ?', [id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  // Prevent toggling eligibility if the student has already voted
  const [votes] = await query(
    'SELECT COUNT(*) AS count FROM votes WHERE voter_reference LIKE ?',
    [`${student.user_id}-%`]
  );
  if (votes[0].count > 0) {
    return res.status(400).json({ message: 'Cannot change eligibility: student has already voted' });
  }

  const newStatus = student.eligibility_status === 'eligible' ? 'ineligible' : 'eligible';
  await query('UPDATE students SET eligibility_status = ? WHERE id = ?', [newStatus, id]);
  res.json({ message: `Eligibility set to ${newStatus}`, student: { ...student, eligibility_status: newStatus } });
}

export async function resetPassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ message: 'newPassword is required' });

  const [student] = await query('SELECT * FROM students WHERE id = ?', [id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const hash = await bcryptHash(newPassword);
  await query('UPDATE students SET password_hash = ? WHERE id = ?', [hash, id]);
  res.json({ message: 'Password reset successfully' });
}

export async function importStudents(req, res) {
  if (!req.file) return res.status(400).json({ message: 'CSV file is required' });

  // Simple CSV parser that handles quoted fields containing commas
  function parseCSV(text) {
    const lines = [];
    let current = '';
    let inQuotes = false;

    for (const char of text) {
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === '\n' && !inQuotes) {
        lines.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) lines.push(current);

    return lines.filter((l) => l.trim());
  }

  const lines = parseCSV(req.file.text);
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const created = [];

  for (let i = 1; i < lines.length; i++) {
    // Parse fields respecting quotes
    const cols = [];
    let field = '';
    inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
        field += char;
      } else if (char === ',' && !inQuotes) {
        cols.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    cols.push(field.trim());

    const row = {};
    header.forEach((h, idx) => (row[h] = idx < cols.length ? cols[idx] : ''));

    if (!row.name || !row.student_id) continue;

    const hash = await bcryptHash(row.password || 'Password123!');
    try {
      await query(
        'INSERT INTO students (user_id, student_id, faculty, department, semester, batch, eligibility_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [hash, row.student_id, row.faculty, row.department, row.semester, row.batch, row.eligibility_status || 'eligible']
      );
      created.push(row.student_id);
    } catch {
      // duplicate student_id — skip
    }
  }

  res.json({ message: `Imported ${created.length} students`, imported: created });
}

async function bcryptHash(password) {
  return bcrypt.hash(password, 10);
}
