import { query } from '../config/db.js';
import { logAction } from './auditController.js';

export async function listCandidates(req, res) {
  const { election_id, position_id, status } = req.query;
  let sql = 'SELECT c.*, p.name AS position_name, s.student_id, s.faculty, s.department, s.semester FROM candidates c';
  sql += ' JOIN positions p ON c.position_id = p.id';
  sql += ' JOIN students s ON c.student_id = s.id';
  const params = [];

  if (election_id) { sql += ' WHERE c.election_id = ?'; params.push(election_id); }
  if (position_id) { sql += ' AND c.position_id = ?'; params.push(position_id); }
  if (status) { sql += ' AND c.approval_status = ?'; params.push(status); }

  const rows = await query(sql, params);
  res.json({ candidates: rows });
}

export async function getCandidate(req, res) {
  const { id } = req.params;
  const [candidate] = await query(
    'SELECT c.*, p.name AS position_name, e.name AS election_name FROM candidates c' +
    ' JOIN positions p ON c.position_id = p.id' +
    ' JOIN elections e ON c.election_id = e.id WHERE c.id = ?',
    [id]
  );
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json({ candidate });
}

export async function createCandidate(req, res) {
  const { student_id, election_id, position_id, symbol, biography, manifesto, campaign_message } = req.body;
  if (!student_id || !election_id || !position_id) {
    return res.status(400).json({ message: 'student_id, election_id and position_id are required' });
  }

  const result = await query(
    'INSERT INTO candidates (student_id, election_id, position_id, symbol, biography, manifesto, campaign_message, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [student_id, election_id, position_id, symbol, biography, manifesto, campaign_message, 'pending']
  );

  await logAction(req.user.id, 'candidate_added', { candidate_id: result.insertId, student_id });
  res.status(201).json({ message: 'Candidate added', candidate_id: result.insertId });
}

export async function updateCandidate(req, res) {
  const { id } = req.params;
  const fields = req.body;
  delete fields.id;

  const [candidate] = await query('SELECT * FROM candidates WHERE id = ?', [id]);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const params = [...keys.map((k) => fields[k]), id];
  await query(`UPDATE candidates SET ${setClause} WHERE id = ?`, params);
  res.json({ message: 'Candidate updated', candidate });
}

export async function approveCandidate(req, res) {
  const { id } = req.params;
  const [candidate] = await query('SELECT * FROM candidates WHERE id = ?', [id]);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

  await query('UPDATE candidates SET approval_status = ? WHERE id = ?', ['approved', id]);
  await logAction(req.user.id, 'candidate_approved', { candidate_id: id, student_id: candidate.student_id });
  res.json({ message: 'Candidate approved', candidate: { ...candidate, approval_status: 'approved' } });
}

export async function rejectCandidate(req, res) {
  const { id } = req.params;
  const [candidate] = await query('SELECT * FROM candidates WHERE id = ?', [id]);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

  await query('UPDATE candidates SET approval_status = ? WHERE id = ?', ['rejected', id]);
  await logAction(req.user.id, 'candidate_rejected', { candidate_id: id, student_id: candidate.student_id });
  res.json({ message: 'Candidate rejected', candidate: { ...candidate, approval_status: 'rejected' } });
}

export async function removeCandidate(req, res) {
  const { id } = req.params;
  const [candidate] = await query('SELECT * FROM candidates WHERE id = ?', [id]);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

  await query('DELETE FROM candidates WHERE id = ?', [id]);
  res.json({ message: 'Candidate removed' });
}

export async function assignToElection(req, res) {
  const { candidate_id } = req.body;
  const { election_id } = req.params;

  const [candidate] = await query('SELECT * FROM candidates WHERE id = ?', [candidate_id]);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

  await query('UPDATE candidates SET election_id = ? WHERE id = ?', [election_id, candidate_id]);
  res.json({ message: 'Candidate assigned to election', candidate: { ...candidate, election_id } });
}

export async function assignToPosition(req, res) {
  const { candidate_id } = req.body;
  const { position_id } = req.params;

  const [candidate] = await query('SELECT * FROM candidates WHERE id = ?', [candidate_id]);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

  await query('UPDATE candidates SET position_id = ? WHERE id = ?', [position_id, candidate_id]);
  res.json({ message: 'Candidate assigned to position', candidate: { ...candidate, position_id } });
}
