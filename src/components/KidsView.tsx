import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getKids, getTasks } from '../storage';
import KidSwitcher from './KidSwitcher';
import TaskBoard from './TaskBoard';

export default function KidsView() {
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [kids, setKids] = useState<Awaited<ReturnType<typeof getKids>>>([]);
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof getTasks>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [k, t] = await Promise.all([getKids(), getTasks()]);
        if (!mounted) return;
        setKids(k);
        setTasks(t);
        setSelectedKidId(prev => prev && k.find(x => x.id === prev) ? prev : k[0]?.id || null);
        setError(null);
      } catch (err) {
        console.warn('Failed to load data', err);
        if (!mounted) return;
        setError('Unable to load data. Try reloading.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const selectedKid = useMemo(
    () => kids.find(k => k.id === selectedKidId) || kids[0],
    [kids, selectedKidId],
  );

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6 relative h-full">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-500">
          {todayLabel}
        </span>
      </div>
      {loading && (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Loading...</div>
      )}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center text-red-600 text-sm text-center px-4">{error}</div>
      )}
      {!loading && !error && kids.length > 0 && selectedKid && (
        <>
          <KidSwitcher
            kids={kids}
            selectedKidId={selectedKid?.id || null}
            onSelectKid={setSelectedKidId}
          />
          <div className="flex-1 min-h-[260px]">
            <TaskBoard
              kid={selectedKid}
              tasks={tasks.filter(t => t.kidId === selectedKid.id && t.isActive)}
            />
          </div>
        </>
      )}
      <Link
        to="/admin"
        aria-label="Open admin"
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-white text-slate-700 shadow-lg shadow-slate-200 border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-200"
      >
        <span role="img" aria-hidden="true">⚙️</span>
      </Link>
    </div>
  );
}
