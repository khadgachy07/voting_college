import { query } from '../config/db.js';
import { logAction } from './auditController.js';

const STATUS_TRANSITIONS = {
  draft: ['upcoming'],
  upcoming: ['active', 'draft'],
  active: ['closed', 'upcoming'],
  closed: ['results_published', 'active'],
  results_published: [],
};

export async function listElections(req, res) {
  const rows = await query('SELECT * FROM elections ORDER BY start_datetime DESC');
  res.json({ elections: rows });
}

export async function getElection(req, res) {
  const { id } = req.params;
  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });
  res.json({ election });
}

export async function createElection(req, res) {
  const { name, description, academic_year, start_datetime, end_datetime } = req.body;
  if (!name || !start_datetime || !end_datetime) {
    return res.status(400).json({ message: 'name, start_datetime and end_datetime are required' });
  }

  const result = await query(
    'INSERT INTO elections (name, description, academic_year, start_datetime, end_datetime, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, academic_year, start_datetime, end_datetime, 'upcoming']
  );

  await logAction(req.user.id, 'election_created', { election_id: result.insertId, name });
  res.status(201).json({ message: 'Election created', election_id: result.insertId });
}

export async function updateElection(req, res) {
  const { id } = req.params;
  const fields = req.body;
  delete fields.id;

  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const params = [...keys.map((k) => fields[k]), id];
  await query(`UPDATE elections SET ${setClause} WHERE id = ?`, params);
  res.json({ message: 'Election updated', election });
}

export async function startElection(req, res) {
  const { id } = req.params;
  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  await query('UPDATE elections SET status = ? WHERE id = ?', ['active', id]);
  await logAction(req.user.id, 'election_started', { election_id: id });
  await broadcastNotification(`Voting for "${election.name}" is now open!`);
  res.json({ message: 'Election started', election: { ...election, status: 'active' } });
}

export async function pauseElection(req, res) {
  const { id } = req.params;
  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  await query('UPDATE elections SET status = ? WHERE id = ?', ['upcoming', id]);
  await logAction(req.user.id, 'election_paused', { election_id: id });
  res.json({ message: 'Election paused', election: { ...election, status: 'upcoming' } });
}

export async function closeElection(req, res) {
  const { id } = req.params;
  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  await query('UPDATE elections SET status = ? WHERE id = ?', ['closed', id]);
  await logAction(req.user.id, 'election_closed', { election_id: id });
  res.json({ message: 'Election closed', election: { ...election, status: 'closed' } });
}

export async function publishResults(req, res) {
  const { id } = req.params;
  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  await query('UPDATE elections SET status = ? WHERE id = ?', ['results_published', id]);
  await logAction(req.user.id, 'results_published', { election_id: id });
  res.json({ message: 'Results published', election: { ...election, status: 'results_published' } });
}

export async function assignVotersToElection(req, res) {
  const { id } = req.params;
  const { student_ids } = req.body;

  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  if (!student_ids || !Array.isArray(student_ids)) {
    return res.status(400).json({ message: 'student_ids must be an array of student IDs' });
  }

  // Assign voters to this election by adding a flag in students table
  const placeholders = student_ids.map(() => '?').join(', ');
  await query(
    `UPDATE students
     SET election_id = ?
     WHERE id IN (${placeholders})`,
    [...student_ids, id]
  );

  await logAction(req.user.id, 'voters_assigned_to_election', { election_id: id, voter_count: student_ids.length });
  res.json({ message: `Assigned ${student_ids.length} voters to election`, election_id: id });
}

export async function changeStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const [election] = await query('SELECT * FROM elections WHERE id = ?', [id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  const allowed = STATUS_TRANSITIONS[election.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Cannot transition from "${election.status}" to "${status}". Allowed: ${allowed.join(', ')}` });
  }

  await query('UPDATE elections SET status = ? WHERE id = ?', [status, id]);
  res.json({ message: 'Status updated', election: { ...election, status } });
}

async function broadcastNotification(message) {
  // In a full system this would push to all eligible voters. Kept as an audit hook.
}
