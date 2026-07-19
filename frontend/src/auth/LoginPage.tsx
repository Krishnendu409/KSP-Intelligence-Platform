import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { ThemeToggle } from '../theme/ThemeToggle';

const DEMO_ACCOUNTS = [
  { username: 'sho.guntur', password: 'ksp-sho-2026', role: 'SHO — own station' },
  { username: 'io.pilibanga', password: 'ksp-io-2026', role: 'IO — own station' },
  { username: 'analyst.modinagar', password: 'ksp-analyst-2026', role: 'Analyst — own district' },
  { username: 'scrb.state', password: 'ksp-scrb-2026', role: 'SCRB — state-wide + audit' },
  { username: 'sp.state', password: 'ksp-sp-2026', role: 'SP — state-wide + audit' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      const redirectTo = (location.state as any)?.from || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [token, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-tactical-950 text-tactical-100">
      <div className="absolute top-4 right-4">
        <ThemeToggle className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-tactical-700 hover:border-accent-cyan text-tactical-400 hover:text-accent-cyan transition-colors text-xxs font-mono" />
      </div>
      <div className="w-full max-w-sm p-6 border border-tactical-700 rounded bg-tactical-900/60">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-accent-cyan" />
          </div>
          <h1 className="font-mono text-sm font-bold tracking-widest text-white">KSP INTELLIGENCE OS</h1>
          <p className="text-xxs font-mono text-tactical-400 mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xxs font-mono text-tactical-400 uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="bg-tactical-950 border border-tactical-600 rounded px-3 py-2 text-sm text-white focus:border-accent-cyan focus:outline-none font-mono"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xxs font-mono text-tactical-400 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-tactical-950 border border-tactical-600 rounded px-3 py-2 text-sm text-white focus:border-accent-cyan focus:outline-none font-mono"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-mono text-accent-red bg-accent-red/10 border border-accent-red/30 rounded px-2 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="mt-2 flex items-center justify-center gap-2 bg-accent-cyan hover:bg-cyan-400 text-tactical-950 font-bold rounded py-2 font-mono text-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <details className="mt-4 group">
          <summary className="flex items-center justify-between text-xxs font-mono text-tactical-500 hover:text-tactical-300 cursor-pointer list-none">
            <span>Local demo accounts (dev only)</span>
            <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.username}
                type="button"
                onClick={() => { setUsername(acct.username); setPassword(acct.password); }}
                className="flex items-center justify-between px-2 py-1 rounded bg-tactical-950 border border-tactical-700 hover:border-accent-cyan text-xxs font-mono text-tactical-300 hover:text-accent-cyan transition-colors text-left"
              >
                <span>{acct.username}</span>
                <span className="text-tactical-500">{acct.role}</span>
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
