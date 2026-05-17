const statuses = ['online', 'online', 'online', 'degraded', 'maintenance'];
const severities = ['low', 'medium', 'high', 'critical'];

export function buildDashboardSnapshot() {
  return {
    runway: pick(['09L active', '27R standby', '09R inspection']),
    lighting: randomMetric(84, 100),
    weather: {
      wind: `${randomMetric(4, 22)} kt`,
      visibility: `${randomMetric(7, 10)} km`,
      qnh: `${randomMetric(1009, 1024)} hPa`
    },
    navaids: randomMetric(80, 100),
    emergency: pick(statuses),
    uptime: `${randomMetric(99, 100)}.${randomMetric(10, 99)}%`,
    threatScore: randomMetric(18, 82),
    activeFlights: randomMetric(18, 44),
    deploymentHealth: pick(['healthy', 'healthy', 'running', 'manual-review']),
    telemetry: Array.from({ length: 8 }, (_, index) => ({
      name: `T-${7 - index}`,
      runway: randomMetric(72, 98),
      cyber: randomMetric(18, 82),
      infra: randomMetric(64, 99)
    })),
    timestamp: new Date().toISOString()
  };
}

export function buildActivityEvent() {
  return {
    id: cryptoId(),
    type: pick(['system', 'security', 'operation', 'pipeline']),
    message: pick([
      'Runway incursion sensor heartbeat confirmed',
      'AI model flagged anomalous API request cadence',
      'Jenkins build promoted to staging environment',
      'Navaids controller completed tolerance check',
      'Emergency siren loop self-test completed'
    ]),
    severity: pick(severities),
    createdAt: new Date().toISOString()
  };
}

export function getModules() {
  return [
    module('Airfield Lighting Control', 'lighting', ['Runway edge lights', 'Approach lights', 'Taxiway guidance', 'PAPI circuits']),
    module('Navaids Monitoring', 'navaids', ['ILS localizer', 'Glide slope', 'DME beacon', 'VOR integrity']),
    module('Weather Information', 'weather', ['METAR feed', 'Wind sensors', 'Ceilometer', 'Visibility sensor']),
    module('ATIS Information', 'atis', ['Voice generator', 'Broadcast channel', 'Message compiler', 'Schedule service']),
    module('Technical Monitoring', 'technical', ['UPS room', 'Fiber backbone', 'Rack temperature', 'Edge gateways']),
    module('Emergency Systems', 'emergency', ['Crash alarm', 'Fire station link', 'Rescue dispatch', 'Emergency phones']),
    module('Datalogging', 'datalogging', ['Event archive', 'Audit stream', 'Retention policy', 'Export service'])
  ];
}

export function getPipeline() {
  return [
    step('GitHub', 'success', 'Webhook received from main branch'),
    step('Jenkins', 'success', 'Build and test stages completed'),
    step('SonarQube', 'warning', 'Maintainability gate requires review'),
    step('Trivy', 'success', 'Container scan passed with no critical CVEs'),
    step('OWASP ZAP', 'warning', 'Passive scan found low-risk headers'),
    step('Docker Build', 'success', 'Frontend and backend images built'),
    step('Kubernetes', 'running', 'k3s staging rollout in progress'),
    step('AWS Deployment', 'standby', 'EC2 promotion waiting for approval')
  ];
}

export function getSecurityHeatmap() {
  return ['Auth API', 'Logs API', 'Dashboard API', 'Socket Gateway', 'Postgres'].map((asset) => ({
    asset,
    bruteForce: randomMetric(8, 78),
    injection: randomMetric(4, 64),
    scanning: randomMetric(15, 86)
  }));
}

function module(name, slug, components) {
  return {
    name,
    slug,
    health: randomMetric(72, 99),
    components: components.map((component) => ({
      component,
      status: pick(statuses),
      metric: randomMetric(62, 100)
    })),
    events: Array.from({ length: 5 }, (_, index) => ({
      id: `${slug}-${index}`,
      message: `${componentLabel(components)} ${pick(['heartbeat normal', 'latency observed', 'operator check completed', 'sync updated'])}`,
      level: pick(['info', 'info', 'warning']),
      createdAt: new Date(Date.now() - index * 900000).toISOString()
    }))
  };
}

function step(name, status, detail) {
  return {
    name,
    status,
    detail,
    duration: `${randomMetric(12, 240)}s`,
    score: randomMetric(73, 99)
  };
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomMetric(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function componentLabel(components) {
  return components[Math.floor(Math.random() * components.length)];
}

function cryptoId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
