import { query } from '../config/db.js';
import { logAction } from './auditController.js';

export async function listPositions(req, res) {
  const { election_id } = req.query;
  let sql = 'SELECT * FROM positions';
  const params = [];
  if (election_id) {
    sql += ' WHERE election_id = ?';
    params.push(election_id);
  }
  const rows = await query(sql, params);
  res.json({ positions: rows });
}

export async function createPosition(req, res) {
  const { election_id, name, description, max_candidates, voting_rule } = req.body;
  if (!election_id || !name) return res.status(400).json({ message: 'election_id and name are required' });

  const result = await query(
    'INSERT INTO positions (election_id, name, description, max_candidates, voting_rule) VALUES (?, ?, ?, ?, ?)',
    [election_id, name, description, max_candidates || 1, voting_rule || 'one_candidate']
  );

  await logAction(req.user.id, 'position_created', { election_id, position_id: result.insertId, name });
  res.status(201).json({ message: 'Position created', position_id: result.insertId });
}

export async function updatePosition(req, res) {
  const { id } = req.params;
  const fields = req.body;
  delete fields.id;

  const [position] = await query('SELECT * FROM positions WHERE id = ?', [id]);
  if (!position) return res.status(404).json({ message: 'Position not found' });

  // If election_id is being updated, validate it exists and the position belongs to it
  if (fields.election_id && fields.election_id !== position.election_id) {
    const [election] = await query('SELECT * FROM elections WHERE id = ?', [fields.election_id]);
    if (!election) return res.status(400).json({ message: 'Election not found' });
  }

  const keys = Object.keys(fields);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const params = [...keys.map((k) => fields[k]), id];
  await query(`UPDATE positions SET ${setClause} WHERE id = ?`, params);
  res.json({ message: 'Position updated', position });
}

export async function deletePosition(req, res) {
  const { id } = req.params;
  const [position] = await query('SELECT * FROM positions WHERE id = ?', [id]);
  if (!position) return res.status(404).json({ message: 'Position not found' });

  await query('DELETE FROM positions WHERE id = ?', [id]);
  res.json({ message: 'Position deleted' });
}
