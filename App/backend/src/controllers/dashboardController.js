import { buildDashboardSnapshot } from '../services/simulationService.js';
import { query } from '../config/db.js';

export async function getDashboard(req, res) {
  const [alerts, logs, status] = await Promise.all([
    query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 5'),
    query('SELECT * FROM logs ORDER BY created_at DESC LIMIT 8'),
    query('SELECT * FROM system_status ORDER BY module, component')
  ]);

  return res.json({
    snapshot: buildDashboardSnapshot(),
    alerts: alerts.rows,
    activity: logs.rows,
    systems: status.rows
  });
}

