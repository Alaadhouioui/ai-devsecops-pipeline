export default function RadarPanel() {
  return (
    <div className="radar glass min-h-72 rounded-lg">
      <div className="absolute inset-x-5 top-5 z-10 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-cyan-200">
        <span>Surface Radar</span>
        <span>Live</span>
      </div>
      <div className="absolute bottom-5 left-5 z-10 text-sm text-slate-300">
        42 tracks monitored<br />0 runway conflicts
      </div>
    </div>
  );
}

