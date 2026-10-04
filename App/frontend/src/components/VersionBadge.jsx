import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function VersionBadge() {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    api.get('/version')
      .then(({ data }) => setVersion(data))
      .catch(() => {});
  }, []);

  const label = version
    ? `v${version.version} · build #${version.buildNumber} · ${version.commit}`
    : 'v-- (offline)';

  return (
    <div className="pointer-events-none fixed bottom-3 right-4 z-10 rounded-full border border-cyan-200/10 bg-slate-950/70 px-3 py-1.5 font-mono text-[10px] tracking-wide text-slate-400 backdrop-blur">
      {label}
    </div>
  );
}
