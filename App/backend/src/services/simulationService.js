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

export function getSecurityPosture(alerts = []) {
  const severityWeight = { low: 12, medium: 28, high: 55, critical: 85 };
  const totalRisk = alerts.reduce((sum, alert) => sum + (severityWeight[alert.severity] || 20), 0);
  const averageRisk = alerts.length ? Math.round(totalRisk / alerts.length) : 18;
  const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length;
  const highCount = alerts.filter((alert) => alert.severity === 'high').length;
  const postureScore = Math.min(100, averageRisk + criticalCount * 8 + highCount * 4);
  const activeIncidents = alerts.filter((alert) => ['critical', 'high'].includes(alert.severity)).length;

  return {
    postureScore,
    riskLevel: postureScore >= 80 ? 'critical' : postureScore >= 60 ? 'high' : postureScore >= 35 ? 'medium' : 'low',
    activeIncidents,
    blockedRequests: 180 + alerts.length * 7 + highCount * 14 + criticalCount * 25,
    failedLogins: 6 + alerts.filter((alert) => /login|auth|brute/i.test(alert.title || '')).length * 4,
    meanTimeToContain: criticalCount ? '18 min' : highCount ? '11 min' : '7 min',
    mitreTactics: [
      tactic('Initial Access', 'T1190', 'Public API probing and unauthorized requests', activeIncidents ? 'high' : 'medium'),
      tactic('Credential Access', 'T1110', 'Failed login bursts and brute-force patterns', criticalCount ? 'critical' : 'medium'),
      tactic('Discovery', 'T1046', 'Port scanning and service enumeration signals', highCount ? 'high' : 'low'),
      tactic('Impact', 'T1499', 'Availability risk against monitoring services', postureScore >= 70 ? 'high' : 'medium')
    ],
    controls: [
      control('JWT authentication', 'implemented', 'Protected API routes require bearer tokens'),
      control('Role-based access', 'implemented', 'Simulation actions restricted to Admin and Engineer'),
      control('Rate limiting', 'implemented', 'Express limiter with trusted proxy configuration'),
      control('Container vulnerability gate', 'implemented', 'Trivy fails CI on HIGH and CRITICAL findings'),
      control('Static analysis gate', 'implemented', 'SonarQube quality gate blocks unsafe promotion'),
      control('Automated DAST', 'planned', 'OWASP ZAP is modeled in the pipeline and ready for active scan integration')
    ],
    playbook: [
      stepItem('Triage', 'Correlate alert severity, affected endpoint, and recent audit logs'),
      stepItem('Contain', 'Block malicious IP ranges and disable suspicious sessions'),
      stepItem('Eradicate', 'Patch vulnerable route, rotate exposed secrets, and redeploy'),
      stepItem('Recover', 'Run health checks, verify telemetry, and document lessons learned')
    ]
  };
}

function tactic(name, technique, description, severity) {
  return { name, technique, description, severity };
}

function control(name, status, evidence) {
  return { name, status, evidence };
}

function stepItem(name, action) {
  return { name, action };
}
