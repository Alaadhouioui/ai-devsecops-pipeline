import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

const users = [
  ['AeroSec Administrator', 'admin@aerosec.local', 'Admin123!', 'Admin'],
  ['Tower Operator', 'operator@aerosec.local', 'Operator123!', 'Operator'],
  ['Systems Engineer', 'engineer@aerosec.local', 'Engineer123!', 'Engineer']
];

export async function seedDemoData() {
  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await query(`
    CREATE TABLE IF NOT EXISTS ai_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_email VARCHAR(180),
      risk_score INTEGER NOT NULL,
      risk_level VARCHAR(30) NOT NULL,
      action VARCHAR(80) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS deployments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      environment VARCHAR(80) NOT NULL,
      version VARCHAR(80) NOT NULL,
      status VARCHAR(30) NOT NULL,
      risk_score INTEGER NOT NULL,
      decision VARCHAR(40) NOT NULL,
      target VARCHAR(120) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const [name, email, password, role] of users) {
    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [name, email, passwordHash, role]
    );
  }

  await query(`
    INSERT INTO deployments (environment, version, status, risk_score, decision, target)
    SELECT *
    FROM (VALUES
      ('local-docker', 'v1.0.0-demo', 'healthy', 22, 'approve', 'Docker Compose'),
      ('k3s-staging', 'v1.0.0-rc2', 'running', 41, 'manual-review', 'single-node k3s'),
      ('aws-ec2-demo', 'v1.0.0-rc1', 'standby', 35, 'approve', 'AWS EC2')
    ) AS seed(environment, version, status, risk_score, decision, target)
    WHERE NOT EXISTS (SELECT 1 FROM deployments)
  `);
}
