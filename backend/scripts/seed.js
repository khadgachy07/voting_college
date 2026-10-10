import { query } from '../src/config/db.js';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { config } from '../src/config/index.js';

const ADMIN = 'admin@college.edu';
const ADMIN_PW = 'Admin@123';
const STUDENT_PW = 'Password123!';

async function cleanup() {
  const pool = mysql.createPool({ host: config.db.host, port: config.db.port, user: config.db.user, password: config.db.password, database: config.db.database });
  await pool.query('DELETE FROM candidates');
  await pool.query('DELETE FROM positions');
  await pool.query('DELETE FROM elections');
  await pool.query('DELETE FROM students');
  await pool.query('DELETE FROM users WHERE role = ? OR email = ?', ['student', ADMIN]);
  await pool.end();
}

async function seed() {
  // Admin (idempotent)
  const adminHash = await bcrypt.hash(ADMIN_PW, 10);
  await query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)', ['Dr. Admin', ADMIN, adminHash, 'admin']);
  const adminId = (await query('SELECT id FROM users WHERE email = ?', [ADMIN]))[0].id;

  // Demo students: create a user row first, then reference its id in students.user_id
  const students = [
    { student_id: 'STU001', name: 'Alice Johnson', faculty: 'Engineering', department: 'Computer Science', semester: '3rd Sem' },
    { student_id: 'STU002', name: 'Bob Smith', faculty: 'Engineering', department: 'Mechanical', semester: '2nd Sem' },
    { student_id: 'STU003', name: 'Carol White', faculty: 'Science', department: 'Physics', semester: '4th Sem' },
    { student_id: 'STU004', name: 'David Brown', faculty: 'Commerce', department: 'Accountancy', semester: '1st Sem' },
    { student_id: 'STU005', name: 'Eve Davis', faculty: 'Arts', department: 'English', semester: '3rd Sem' },
  ];

  const createdStudents = [];
  for (const s of students) {
    const hash = await bcrypt.hash(STUDENT_PW, 10);
    try {
      const result = await query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [s.name, `${s.student_id}@college.edu`, hash, 'student']);
      await query('INSERT INTO students (user_id, student_id, faculty, department, semester, eligibility_status) VALUES (?, ?, ?, ?, ?, ?)', [result.insertId, s.student_id, s.faculty, s.department, s.semester, 'eligible']);
      const student = (await query('SELECT id FROM students WHERE user_id = ?', [result.insertId]))[0];
      createdStudents.push({ ...student, ...s, user_id: result.insertId });
    } catch {
      // duplicate student — skip
    }
  }

  // Election + positions (idempotent: upsert by name)
  const electionRes = await query('INSERT INTO elections (name, description, academic_year, start_datetime, end_datetime, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description), status = VALUES(status)', [
    'College Council Elections 2026',
    'Annual student council elections for the new academic year.',
    '2026-2027',
    '2026-11-01 09:00:00',
    '2026-11-15 18:00:00',
    'active',
  ]);
  const electionId = electionRes.insertId || (await query('SELECT id FROM elections WHERE name = ?', ['College Council Elections 2026']))[0].id;

  const positions = [
    { name: 'President', description: 'Lead the student council', max_candidates: 3, voting_rule: 'one_candidate' },
    { name: 'Vice President', description: 'Support the president', max_candidates: 2, voting_rule: 'one_candidate' },
    { name: 'Secretary', description: 'Handle documentation', max_candidates: 2, voting_rule: 'one_candidate' },
  ];

  for (const p of positions) {
    try {
      await query('INSERT INTO positions (election_id, name, description, max_candidates, voting_rule) VALUES (?, ?, ?, ?, ?)', [electionId, p.name, p.description, p.max_candidates, p.voting_rule]);
    } catch {
      // position already exists — skip
    }
  }

  // Candidates (only for approved ones, idempotent by student_id+position)
  const candidateData = [
    { student_id: 'STU001', symbol: '🦁', position: 'President', manifesto: 'Digital transformation for campus life.', campaign: 'Let\'s modernize our college!' },
    { student_id: 'STU002', symbol: '🐯', position: 'President', manifesto: 'Infrastructure and sports development.', campaign: 'Stronger together.' },
    { student_id: 'STU003', symbol: '🦅', position: 'President', manifesto: 'Academic excellence and research.', campaign: 'Knowledge is power.' },
    { student_id: 'STU001', symbol: '🌟', position: 'Vice President', manifesto: 'Student welfare first.', campaign: 'Your voice matters.' },
    { student_id: 'STU004', symbol: '🐻', position: 'Vice President', manifesto: 'Financial transparency.', campaign: 'Accountable leadership.' },
  ];

  for (const c of candidateData) {
    const pos = await query('SELECT id FROM positions WHERE name = ? AND election_id = ?', [c.position, electionId]);
    if (!pos.length) continue;
    const student = createdStudents.find((s) => s.student_id === c.student_id);
    if (!student) continue;
    try {
      await query('INSERT INTO candidates (student_id, election_id, position_id, symbol, manifesto, campaign_message, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?)', [student.id, electionId, pos[0].id, c.symbol, c.manifesto, c.campaign, 'approved']);
    } catch {
      // duplicate — skip
    }
  }

  console.log('✅ Seed complete. Admin:', ADMIN, '| Password:', ADMIN_PW);
  console.log('   Students use password:', STUDENT_PW);
}

cleanup().then(async () => {
  await seed();
  process.exit(0);
}).catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
