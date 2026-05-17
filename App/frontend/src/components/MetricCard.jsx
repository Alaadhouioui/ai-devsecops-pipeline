import { motion } from 'framer-motion';

export default function MetricCard({ icon: Icon, label, value, detail, accent = 'text-cyan-200' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className={`mt-3 text-2xl font-semibold ${accent}`}>{value}</p>
          {detail && <p className="mt-1 text-sm text-slate-400">{detail}</p>}
        </div>
        {Icon && <Icon className="h-5 w-5 text-cyan-300" />}
      </div>
    </motion.div>
  );
}

