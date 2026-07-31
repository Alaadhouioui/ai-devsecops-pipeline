import { useEffect, useState } from 'react';
import { Bug, ClipboardCheck, Crosshair, LockKeyhole, Radar, ShieldAlert, ShieldCheck, Siren, Timer, Workflow } from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../services/api.js';

const simulations = [
  ['SQL Injection attempt detected', 'high', Bug],
  ['Port scanning detected', 'medium', Radar],
  ['Unauthorized API request', 'medium', ShieldAlert],
  ['Suspicious login behavior', 'critical', Siren]
];

const emptyPosture = {
  postureScore: 0,
  riskLevel: 'low',
  activeIncidents: 0,
  blockedRequests: 0,
  failedLogins: 0,
  meanTimeToContain: '0 min',
  mitreTactics: [],
  controls: [],
  playbook: []
};

export default function Security() {
  const [alerts, setAlerts] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [posture, setPosture] = useState(emptyPosture);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await api.get('/security/alerts');
    setAlerts(data.alerts || []);
    setHeatmap(data.heatmap || []);
    setPosture(data.posture || emptyPosture);
    setLoading(false);
  }

  async function simulate(title, severity) {
    await api.post('/security/simulate', { title, severity });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">AI Security Monitoring</p>
          <h2 className="mt-2 text-3xl font-semibold">Cybersecurity Operations Center</h2>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-cyan-300" />
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Current posture</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold text-cyan-100">{posture.postureScore}%</span>
              <StatusPill status={posture.riskLevel} />
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={ShieldAlert} label="Risk Score" value={posture.postureScore} detail="Weighted alert severity" accent="text-alert" />
        <MetricCard icon={Siren} label="Active Incidents" value={posture.activeIncidents} detail="High and critical cases" />
        <MetricCard icon={LockKeyhole} label="Blocked Requests" value={posture.blockedRequests} detail="API and WAF simulation" />
        <MetricCard icon={Timer} label="MTTC" value={posture.meanTimeToContain} detail="Mean time to contain" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass rounded-lg p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Threat Surface Heatmap</h3>
            <StatusPill status={loading ? 'running' : posture.riskLevel} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {heatmap.map((row) => (
              <div key={row.asset} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-medium">{row.asset}</p>
                {['bruteForce', 'injection', 'scanning'].map((key) => (
                  <div key={key} className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-slate-400">
                      <span>{key}</span>
                      <span>{row[key]}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-white/10">
                      <div className="h-full rounded bg-gradient-to-r from-cyan-300 via-amber-300 to-alert" style={{ width: row[key] + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <h3 className="font-semibold">MITRE ATT&CK Mapping</h3>
          <div className="mt-4 space-y-3">
            {posture.mitreTactics.map((tactic) => (
              <div key={tactic.technique} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{tactic.name}</p>
                    <p className="text-xs uppercase tracking-wide text-cyan-200">{tactic.technique}</p>
                  </div>
                  <StatusPill status={tactic.severity} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{tactic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="glass rounded-lg p-5">
          <h3 className="font-semibold">Attack Simulation Lab</h3>
          <div className="mt-4 grid gap-3">
            {simulations.map(([title, severity, Icon]) => (
              <button key={title} onClick={() => simulate(title, severity)} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-cyan-300/10">
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <span>{title}</span>
                </span>
                <StatusPill status={severity} />
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-cyan-300" />
            <h3 className="font-semibold">Incident Response Playbook</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {posture.playbook.map((item, index) => (
              <div key={item.name} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-cyan-200">Step {index + 1}</p>
                <p className="mt-2 font-medium">{item.name}</p>
                <p className="mt-2 text-sm text-slate-400">{item.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="glass rounded-lg p-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-cyan-300" />
            <h3 className="font-semibold">Security Control Coverage</h3>
          </div>
          <div className="mt-4 space-y-3">
            {posture.controls.map((control) => (
              <div key={control.name} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{control.name}</p>
                  <StatusPill status={control.status} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{control.evidence}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <div className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-cyan-300" />
            <h3 className="font-semibold">Security Logs and Alerts</h3>
          </div>
          <div className="mt-4 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{alert.title}</p>
                  <StatusPill status={alert.severity} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{alert.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-cyan-200">{alert.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
