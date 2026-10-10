import { query } from '../config/db.js';

export async function listAudit(req, res) {
  const rows = await query(
    'SELECT al.*, u.name AS user_name FROM audit_log al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC'
  );
  res.json({ logs: rows });
}

export async function logAction(userId, action, details) {
  await query(
    'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
    [userId, action, JSON.stringify(details || {})]
  );
}
