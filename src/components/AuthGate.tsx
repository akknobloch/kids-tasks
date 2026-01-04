import { useEffect, useState, type ReactNode } from 'react';

const AUTH_KEY = 'kids-tasks-auth';
const TOKEN_KEY = 'kids-tasks-token';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const safeGet = (key: string) => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (err) {
      console.warn('localStorage get failed', err);
      return null;
    }
  };

  const safeSet = (key: string, value: string) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn('localStorage set failed', err);
    }
  };

  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = safeGet(AUTH_KEY);
    const token = safeGet(TOKEN_KEY);
    if (stored === 'ok' && token) setAuthed(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: input.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        safeSet(AUTH_KEY, 'ok');
        safeSet(TOKEN_KEY, data.token);
        setAuthed(true);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="soft-card rounded-3xl p-6 sm:p-8 max-w-md w-full text-left">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome</h1>
        <p className="text-slate-600 mb-4 text-sm">
          Enter the family password to open the task board.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
