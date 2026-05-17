import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const fallback = [
  { name: 'T-7', runway: 84, cyber: 34, infra: 78 },
  { name: 'T-6', runway: 88, cyber: 42, infra: 82 },
  { name: 'T-5', runway: 81, cyber: 38, infra: 80 },
  { name: 'T-4', runway: 91, cyber: 52, infra: 86 },
  { name: 'T-3', runway: 87, cyber: 46, infra: 89 },
  { name: 'T-2', runway: 94, cyber: 58, infra: 91 },
  { name: 'T-1', runway: 90, cyber: 41, infra: 84 },
  { name: 'Live', runway: 96, cyber: 35, infra: 93 }
];

export default function TelemetryChart({ data = fallback }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="runway" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#30d5ff" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#30d5ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cyber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#071323', border: '1px solid rgba(125,211,252,0.2)', borderRadius: 8 }}
            labelStyle={{ color: '#e5f7ff' }}
          />
          <Area type="monotone" dataKey="runway" stroke="#30d5ff" fill="url(#runway)" strokeWidth={2} />
          <Area type="monotone" dataKey="cyber" stroke="#ff4d6d" fill="url(#cyber)" strokeWidth={2} />
          <Area type="monotone" dataKey="infra" stroke="#a7f3d0" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

