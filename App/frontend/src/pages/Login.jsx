import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, RadioTower } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';
import { api } from '../services/api.js';

const accounts = [
  ['Admin', 'admin@aerosec.local', 'Admin123!'],
  ['Operator', 'operator@aerosec.local', 'Operator123!'],
  ['Engineer', 'engineer@aerosec.local', 'Engineer123!']
];

export default function Login() {
  const { navigate } = useNavigation();
  const { loginSession } = useAuth();
  const [form, setForm] = useState({ email: accounts[1][1], password: accounts[1][2] });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      loginSession(data.token, data.user);
      navigate('/');
    } catch {
      setError('Login failed. Use one of the seeded demo accounts.');
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass rounded-lg p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
              <RadioTower className="h-7 w-7 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">AeroSec Tower</h1>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Integrated Monitoring Lab</p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {accounts.map(([role, email, password]) => (
              <button
                key={role}
                onClick={() => setForm({ email, password })}
                className="rounded-lg border border-cyan-200/15 bg-white/5 p-4 text-left hover:bg-cyan-300/10"
              >
                <p className="font-medium text-cyan-100">{role}</p>
                <p className="mt-1 text-xs text-slate-400">{email}</p>
              </button>
            ))}
          </div>
        </section>

        <form onSubmit={submit} className="glass rounded-lg p-8">
          <div className="mb-6 flex items-center gap-2 text-cyan-100">
            <Lock className="h-5 w-5" />
            Secure JWT Login
          </div>
          <label className="text-sm text-slate-300">Email</label>
          <input className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <label className="mt-4 block text-sm text-slate-300">Password</label>
          <input type="password" className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 outline-none focus:border-cyan-300" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          {error && <p className="mt-4 text-sm text-alert">{error}</p>}
          <button className="mt-6 w-full rounded-lg bg-cyan-300 px-4 py-3 font-semibold text-slate-950 shadow-glow hover:bg-cyan-200">Enter Operations Console</button>
        </form>
      </motion.div>
    </div>
  );
}
