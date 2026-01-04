import { useEffect, useState, type ReactNode } from 'react';

const AUTH_KEY = 'kids-tasks-auth';
const APP_PASSWORD = (import.meta.env.VITE_APP_PASSWORD as string | undefined)?.trim();

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!APP_PASSWORD) {
      setAuthed(true); // No password configured, skip gate
      return;
    }
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'ok') setAuthed(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!APP_PASSWORD) {
      setAuthed(true);
      return;
    }
    if (input.trim() === APP_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'ok');
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect password');
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
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
