import { useEffect, useState } from 'react';
import { AlertTriangle, CloudSun, Plane, Power, Radio, Shield } from 'lucide-react';
import ChartBars from '../components/ChartBars.jsx';
import MetricCard from '../components/MetricCard.jsx';
import RadarPanel from '../components/RadarPanel.jsx';
import StatusPill from '../components/StatusPill.jsx';
import TelemetryChart from '../components/TelemetryChart.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { api } from '../services/api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { snapshot, events } = useSocket();
  const live = snapshot || data?.snapshot;

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setData(data));
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Airport Operations Center</p>
          <h2 className="mt-2 text-3xl font-semibold">Integrated Tower Monitoring</h2>
        </div>
        <StatusPill status="online" />
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Plane} label="Active Runway" value={live?.runway || 'Loading'} detail={`${live?.activeFlights || 0} active tracks`} />
        <MetricCard icon={Power} label="Airfield Lighting" value={`${live?.lighting || 0}%`} detail="Edge, approach, taxiway" />
        <MetricCard icon={CloudSun} label="Weather" value={live?.weather?.wind || '0 kt'} detail={`${live?.weather?.visibility || '-'} visibility`} />
        <MetricCard icon={Shield} label="AI Threat Score" value={live?.threatScore || 0} detail="Adaptive anomaly model" accent="text-alert" />
      </section>

      <section className="glass rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Realtime Telemetry Simulation</h3>
          <StatusPill status={live?.deploymentHealth || 'healthy'} />
        </div>
        <TelemetryChart data={live?.telemetry} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <RadarPanel />
        <div className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">System Health</h3>
            <Radio className="h-5 w-5 text-cyan-300" />
          </div>
          <ChartBars values={[88, live?.lighting || 90, live?.navaids || 85, 76, 94, live?.threatScore || 40]} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(data?.systems || []).slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm">{item.component}</p>
                  <StatusPill status={item.status} />
                </div>
                <p className="mt-2 text-xs text-slate-400">{item.module} - {item.metric}%</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Video Surveillance</h3>
            <StatusPill status="online" />
          </div>
          <div className="relative h-56 overflow-hidden rounded-lg border border-cyan-200/15 bg-slate-950">
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute left-4 top-4 rounded bg-black/40 px-2 py-1 text-xs text-cyan-100">CAM TWR-04 / Apron North</div>
            <div className="absolute bottom-5 left-1/2 h-16 w-48 -translate-x-1/2 rounded-t-full border border-cyan-300/30 bg-cyan-300/10" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cyan-300/10 to-transparent" />
          </div>
        </div>
        <Panel title="Airport Activity Feed">
          {[...events, ...(data?.activity || [])].slice(0, 6).map((event) => (
            <Row key={event.id} left={event.message} right={event.severity || event.level} detail={event.source || event.type} />
          ))}
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="AI Security Alerts" icon={AlertTriangle}>
          {(data?.alerts || []).map((alert) => (
            <Row key={alert.id} left={alert.title} right={alert.severity} detail={alert.description} />
          ))}
        </Panel>
        <Panel title="Emergency and Navaids">
          <Row left="Emergency systems" right={live?.emergency || 'online'} detail="Crash alarm network, rescue dispatch, emergency phones" />
          <Row left="Navigation systems" right={`${live?.navaids || 0}%`} detail="ILS, DME, VOR and integrity monitor" />
          <Row left="System uptime" right={live?.uptime || '99.90%'} detail="Backend, database, telemetry socket and frontend" />
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-alert" />}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ left, right, detail }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-100">{left}</p>
        <span className="text-xs uppercase text-cyan-200">{right}</span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
