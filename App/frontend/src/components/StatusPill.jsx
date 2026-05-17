export default function StatusPill({ status = 'online' }) {
  const color = {
    online: 'bg-emerald-400',
    success: 'bg-emerald-400',
    approve: 'bg-emerald-400',
    healthy: 'bg-emerald-400',
    running: 'bg-cyan-300',
    standby: 'bg-slate-400',
    'manual-review': 'bg-amber-300',
    warning: 'bg-amber-300',
    medium: 'bg-amber-300',
    high: 'bg-orange-400',
    degraded: 'bg-amber-300',
    maintenance: 'bg-violet-300',
    critical: 'bg-alert',
    offline: 'bg-slate-500',
    simulated: 'bg-sky-300'
  }[status] || 'bg-cyan-300';

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-200">
      <span className={`h-2 w-2 rounded-full ${color} shadow-glow`} />
      {status}
    </span>
  );
}
