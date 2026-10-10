import { query } from '../config/db.js';
import { logAction } from './auditController.js';

export async function castVote(req, res) {
  const { election_id, position_id, candidate_id } = req.body;
  if (!election_id || !position_id || !candidate_id) {
    return res.status(400).json({ message: 'election_id, position_id and candidate_id are required' });
  }

  // Verify voter is an eligible student
  const [student] = await query('SELECT * FROM students WHERE user_id = ?', [req.user.id]);
  if (!student) return res.status(403).json({ message: 'Only eligible students can vote' });
  if (student.eligibility_status !== 'eligible') {
    return res.status(403).json({ message: 'Voter is not eligible to vote' });
  }

  // Election must be active
  const [election] = await query('SELECT status FROM elections WHERE id = ?', [election_id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });
  if (election.status !== 'active') {
    return res.status(400).json({ message: `Election is ${election.status}, cannot vote` });
  }

  // Position must belong to this election
  const [position] = await query('SELECT id FROM positions WHERE id = ? AND election_id = ?', [position_id, election_id]);
  if (!position) return res.status(404).json({ message: 'Position not found in this election' });

  // Candidate must belong to this position
  const [candidate] = await query('SELECT id FROM candidates WHERE id = ? AND position_id = ? AND approval_status = ?', [candidate_id, position_id, 'approved']);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found for this position' });

  // One vote per voter per position — deterministic reference from voter + position
  const voterReference = `${req.user.id}-${position_id}`;
  const existing = await query('SELECT id FROM votes WHERE voter_reference = ?', [voterReference]);
  if (existing.length) {
    return res.status(409).json({ message: 'You have already voted in this position' });
  }

  // Check max_candidates limit for the position
  const [pos] = await query('SELECT * FROM positions WHERE id = ?', [position_id]);
  if (pos.voting_rule === 'one_candidate') {
    const [candidateCount] = await query(
      'SELECT COUNT(*) AS count FROM candidates WHERE election_id = ? AND position_id = ?',
      [election_id, position_id]
    );
    if ((candidateCount[0].count || 0) >= (position.max_candidates || 1)) {
      return res.status(400).json({ message: 'Maximum candidates reached for this position' });
    }
  }

  const result = await query(
    'INSERT INTO votes (election_id, position_id, candidate_id, voter_reference) VALUES (?, ?, ?, ?)',
    [election_id, position_id, candidate_id, voterReference]
  );

  await logAction(req.user.id, 'student_voted', { election_id, position_id, candidate_id });
  res.status(201).json({ message: 'Vote submitted successfully', vote_id: result.insertId });
}

export async function myVotes(req, res) {
  const rows = await query(
    'SELECT v.election_id, v.position_id, p.name AS position_name, c.symbol, c.id AS candidate_id FROM votes v' +
    ' JOIN positions p ON v.position_id = p.id' +
    ' JOIN candidates c ON v.candidate_id = c.id WHERE v.voter_reference LIKE ?',
    [`${req.user.id}-%`]
  );
  res.json({ votes: rows });
}

export async function electionStats(req, res) {
  const { election_id } = req.params;
  const [election] = await query('SELECT * FROM elections WHERE id = ?', [election_id]);
  if (!election) return res.status(404).json({ message: 'Election not found' });

  const totalVotes = await query('SELECT COUNT(*) AS count FROM votes WHERE election_id = ?', [election_id]);
  const totalEligible = await query('SELECT COUNT(*) AS count FROM students WHERE eligibility_status = ?', ['eligible']);

  // Per-position breakdown
  const positions = await query(
    'SELECT p.id, p.name, COUNT(v.id) AS votes, GROUP_CONCAT(c.id ORDER BY v.id) AS candidate_ids' +
    ' FROM positions p LEFT JOIN votes v ON p.id = v.position_id AND v.election_id = ?' +
    ' LEFT JOIN candidates c ON v.candidate_id = c.id' +
    ' WHERE p.election_id = ? GROUP BY p.id ORDER BY p.id',
    [election_id, election_id]
  );

  const results = [];
  for (const p of positions) {
    const candidateIds = (p.candidate_ids || '').split(',').filter(Boolean).map(Number);
    const candidates = [];
    for (const id of candidateIds) {
      const [row] = await query('SELECT c.id, c.symbol, COUNT(v.id) AS votes FROM votes v JOIN candidates c ON v.candidate_id = c.id WHERE v.position_id = ? AND v.election_id = ? GROUP BY c.id ORDER BY votes DESC', [p.id, election_id]);
      if (row) candidates.push(row);
    }
    results.push({ id: p.id, name: p.name, totalVotes: parseInt(p.votes || '0', 10), candidates });
  }

  res.json({
    election,
    totalVotes: parseInt(totalVotes[0].count, 10),
    totalEligible: parseInt(totalEligible[0].count, 10),
    turnout: totalEligible ? Math.round((totalVotes / totalEligible) * 100) : 0,
    positions: results,
  });
}
