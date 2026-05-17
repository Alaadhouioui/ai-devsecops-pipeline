import { useEffect, useState } from 'react';
import { Activity, RadioTower } from 'lucide-react';
import ChartBars from '../components/ChartBars.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../services/api.js';

export default function Modules() {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    api.get('/modules').then(({ data }) => setModules(data.modules));
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Tower Subsystems</p>
        <h2 className="mt-2 text-3xl font-semibold">Monitoring Modules</h2>
      </header>
      <div className="grid gap-5 xl:grid-cols-2">
        {modules.map((module) => (
          <article key={module.slug} className="glass rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <RadioTower className="h-5 w-5 text-cyan-300" />
                  <h3 className="font-semibold">{module.name}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-400">Operational health: {module.health}%</p>
              </div>
              <StatusPill status={module.health > 80 ? 'online' : 'degraded'} />
            </div>
            <div className="mt-5">
              <ChartBars values={module.components.map((item) => item.metric)} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {module.components.map((item) => (
                <div key={item.component} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm">{item.component}</p>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Signal quality {item.metric}%</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {module.events.map((event) => (
                <div key={event.id} className="flex items-center gap-2 text-xs text-slate-400">
                  <Activity className="h-3.5 w-3.5 text-cyan-300" />
                  {event.message}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

