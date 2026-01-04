import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getKids, getTasks } from '../storage';
import KidSwitcher from './KidSwitcher';
import TaskBoard from './TaskBoard';

export default function KidsView() {
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const kids = getKids();
  const tasks = getTasks();

  const selectedKid = kids.find(k => k.id === selectedKidId) || kids[0];
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
