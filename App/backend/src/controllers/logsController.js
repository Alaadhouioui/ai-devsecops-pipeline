import { query } from '../config/db.js';

export async function listLogs(req, res) {
  const search = `%${req.query.search || ''}%`;
  const result = await query(
    `SELECT id, source, level, message, created_at, 'log' AS type
     FROM logs
     WHERE source ILIKE $1 OR level ILIKE $1 OR message ILIKE $1
     UNION ALL
     SELECT id, COALESCE(user_email, 'system') AS source, 'audit' AS level, action AS message, created_at, 'audit' AS type
     FROM audit_events
     WHERE COALESCE(user_email, '') ILIKE $1 OR action ILIKE $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [search]
  );

  return res.json({ logs: result.rows });
}

