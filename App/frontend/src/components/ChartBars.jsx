export default function ChartBars({ values = [62, 88, 74, 95, 68, 83] }) {
  return (
    <div className="flex h-28 items-end gap-2">
      {values.map((value, index) => (
        <div key={index} className="flex flex-1 items-end rounded bg-white/5">
          <div
            className="w-full rounded bg-gradient-to-t from-cyan-500 to-sky-200 shadow-glow"
            style={{ height: `${value}%` }}
          />
        </div>
      ))}
    </div>
  );
}

