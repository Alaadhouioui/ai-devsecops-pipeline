import { query } from '../config/db.js';
import { getPipeline } from '../services/simulationService.js';

export async function getDevSecOps(req, res) {
  const deployments = await query('SELECT * FROM deployments ORDER BY created_at DESC LIMIT 5');

  return res.json({
    pipeline: getPipeline(),
    deployments: deployments.rows,
    aiDecision: {
      decision: 'manual-review',
      riskScore: 41,
      reason: 'SonarQube maintainability warning and OWASP ZAP passive findings require engineer validation'
    },
    containers: [
      { name: 'frontend', status: 'healthy', cpu: '3%', memory: '86MB' },
      { name: 'backend', status: 'healthy', cpu: '7%', memory: '142MB' },
      { name: 'postgres', status: 'healthy', cpu: '5%', memory: '210MB' },
      { name: 'k3s-staging', status: 'simulated', cpu: '18%', memory: '640MB' }
    ]
  });
}
