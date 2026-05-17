import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../services/api.js';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/logs').then(({ data }) => setLogs(data.logs));
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return logs.filter((log) => [log.source, log.level, log.message].join(' ').toLowerCase().includes(term));
  }, [logs, search]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Audit and Datalogging</p>
        <h2 className="mt-2 text-3xl font-semibold">Logs Console</h2>
      </header>
      <div className="glass flex items-center gap-3 rounded-lg p-3">
        <Search className="h-5 w-5 text-cyan-300" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user actions, security events, errors..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" />
      </div>
      <div className="glass overflow-hidden rounded-lg">
        <div className="grid grid-cols-[1fr_0.6fr_0.5fr] gap-3 border-b border-white/10 p-4 text-xs uppercase tracking-[0.22em] text-slate-400 md:grid-cols-[0.7fr_0.4fr_1fr_0.5fr]">
          <span>Source</span>
          <span>Level</span>
          <span className="hidden md:block">Message</span>
          <span>Type</span>
        </div>
        {filtered.map((log) => (
          <div key={log.id} className="grid grid-cols-[1fr_0.6fr_0.5fr] gap-3 border-b border-white/5 p-4 text-sm md:grid-cols-[0.7fr_0.4fr_1fr_0.5fr]">
            <span>{log.source}</span>
            <span><StatusPill status={log.level === 'warning' ? 'warning' : 'online'} /></span>
            <span className="hidden text-slate-300 md:block">{log.message}</span>
            <span className="text-cyan-200">{log.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

