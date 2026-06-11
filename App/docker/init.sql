CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('Admin', 'Operator', 'Engineer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(80) NOT NULL,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(180) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(80) NOT NULL,
  component VARCHAR(120) NOT NULL,
  status VARCHAR(30) NOT NULL,
  metric INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(180),
  action VARCHAR(160) NOT NULL,
  ip_address VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(180),
  risk_score INTEGER NOT NULL,
  risk_level VARCHAR(30) NOT NULL,
  action VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment VARCHAR(80) NOT NULL,
  version VARCHAR(80) NOT NULL,
  status VARCHAR(30) NOT NULL,
  risk_score INTEGER NOT NULL,
  decision VARCHAR(40) NOT NULL,
  target VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role) VALUES
('AeroSec Administrator', 'admin@aerosec.local', crypt('Admin123!', gen_salt('bf')), 'Admin'),
('Tower Operator', 'operator@aerosec.local', crypt('Operator123!', gen_salt('bf')), 'Operator'),
('Systems Engineer', 'engineer@aerosec.local', crypt('Engineer123!', gen_salt('bf')), 'Engineer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO logs (source, level, message) VALUES
('RUNWAY-09L', 'info', 'Runway centerline sensors synchronized'),
('CYBER-AI', 'warning', 'Suspicious login velocity detected for external IP'),
('NAVAIDS', 'info', 'ILS localizer operating within tolerance'),
('WEATHER', 'info', 'Wind shear model updated'),
('DOCKER', 'info', 'Backend container health check passed');

INSERT INTO alerts (title, severity, category, description) VALUES
('SQL Injection attempt detected', 'high', 'Application Security', 'Pattern matched against authentication endpoint payload'),
('Port scanning detected', 'medium', 'Network', 'Multiple closed-port probes detected from same source'),
('Unauthorized API request', 'medium', 'Access Control', 'JWT verification failed on protected route'),
('Runway lighting controller latency', 'low', 'Operational', 'Edge controller response time exceeded normal threshold');

INSERT INTO system_status (module, component, status, metric) VALUES
('Airfield Lighting', 'Runway 09L Edge Lights', 'online', 96),
('Airfield Lighting', 'Taxiway Alpha', 'online', 91),
('Navaids', 'ILS Localizer', 'online', 98),
('Navaids', 'DME Beacon', 'degraded', 73),
('Weather', 'METAR Feed', 'online', 95),
('ATIS', 'Voice Generator', 'online', 89),
('Technical Monitoring', 'UPS Room A', 'online', 94),
('Emergency Systems', 'Crash Alarm Network', 'online', 99);

INSERT INTO audit_events (user_email, action, ip_address) VALUES
('admin@aerosec.local', 'Seeded demo users and enterprise monitoring data', '127.0.0.1'),
('operator@aerosec.local', 'Viewed live tower dashboard', '127.0.0.1');

INSERT INTO deployments (environment, version, status, risk_score, decision, target) VALUES
('local-docker', 'v1.0.0-demo', 'healthy', 22, 'approve', 'Docker Compose'),
('k3s-staging', 'v1.0.0-rc2', 'running', 41, 'manual-review', 'single-node k3s'),
('aws-ec2-demo', 'v1.0.0-rc1', 'standby', 35, 'approve', 'AWS EC2')
ON CONFLICT DO NOTHING;
