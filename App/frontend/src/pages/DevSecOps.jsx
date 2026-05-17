import { useEffect, useState } from 'react';
import { CheckCircle, Cloud, Container, GitBranch, RadioTower, ShieldCheck, Workflow } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../services/api.js';

const icons = [GitBranch, Workflow, CheckCircle, ShieldCheck, ShieldCheck, Container, RadioTower, Cloud];

export default function DevSecOps() {
  const [data, setData] = useState({ pipeline: [], containers: [], deployments: [], aiDecision: null });

  useEffect(() => {
    api.get('/devsecops').then(({ data }) => setData(data));
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Secure Delivery Pipeline</p>
        <h2 className="mt-2 text-3xl font-semibold">GitHub to k3s and AWS Deployment</h2>
      </header>
      <section className="glass rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.pipeline.map((step, index) => {
            const Icon = icons[index] || CheckCircle;
            return (
              <div key={step.name} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <Icon className="h-6 w-6 text-cyan-300" />
                <p className="mt-4 font-medium">{step.name}</p>
                <p className="mt-2 text-xs text-slate-400">{step.detail}</p>
                <div className="mt-4 flex items-center justify-between">
                  <StatusPill status={step.status} />
                  <span className="text-xs text-slate-400">{step.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="glass rounded-lg p-5">
          <h3 className="font-semibold">Quality and Security Scores</h3>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.pipeline}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={70} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#071323', border: '1px solid rgba(125,211,252,0.2)', borderRadius: 8 }} />
                <Bar dataKey="score" fill="#30d5ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <h3 className="font-semibold">AI Deployment Decision</h3>
          <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold text-amber-100">{data.aiDecision?.riskScore || 0}%</p>
              <StatusPill status={data.aiDecision?.decision || 'manual-review'} />
            </div>
            <p className="mt-3 text-sm text-slate-300">{data.aiDecision?.reason}</p>
          </div>
          <h3 className="mt-6 font-semibold">Container Health</h3>
          <div className="mt-4 space-y-3">
            {data.containers.map((container) => (
              <div key={container.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                <div>
                  <p className="font-medium">{container.name}</p>
                  <p className="text-xs text-slate-400">CPU {container.cpu} - Memory {container.memory}</p>
                </div>
                <StatusPill status={container.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass rounded-lg p-5">
        <h3 className="font-semibold">Deployment Targets</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.deployments.map((deployment) => (
            <div key={deployment.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{deployment.environment}</p>
                <StatusPill status={deployment.status} />
              </div>
              <p className="mt-2 text-sm text-slate-400">{deployment.target} - {deployment.version}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-400">Risk score</span>
                <span className="text-cyan-100">{deployment.risk_score}%</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Decision</span>
                <StatusPill status={deployment.decision} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
