import { useEffect, useState } from 'react';
import { Bug, Radar, ShieldAlert, Siren } from 'lucide-react';
import MetricCard from '../components/MetricCard.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../services/api.js';

const simulations = [
  ['SQL Injection attempt detected', 'high', Bug],
  ['Port scanning detected', 'medium', Radar],
  ['Unauthorized API request', 'medium', ShieldAlert],
  ['Suspicious login behavior', 'critical', Siren]
];

export default function Security() {
  const [alerts, setAlerts] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  async function load() {
    const { data } = await api.get('/security/alerts');
    setAlerts(data.alerts);
    setHeatmap(data.heatmap || []);
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
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">AI Security Monitoring</p>
        <h2 className="mt-2 text-3xl font-semibold">Cybersecurity Operations</h2>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={ShieldAlert} label="Threat Score" value="67" detail="Machine learning anomaly index" accent="text-alert" />
        <MetricCard icon={Bug} label="Failed Logins" value="14" detail="Last 24 hours" />
        <MetricCard icon={Radar} label="Blocked Requests" value="238" detail="WAF and API layer" />
      </section>
      <section className="glass rounded-lg p-5">
        <h3 className="font-semibold">Fake Security Heatmap</h3>
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
                    <div className="h-full rounded bg-gradient-to-r from-cyan-300 to-alert" style={{ width: `${row[key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
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
          <h3 className="font-semibold">Security Logs and Alerts</h3>
          <div className="mt-4 space-y-3">
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
