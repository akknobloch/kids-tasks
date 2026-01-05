import { useDroppable } from '@dnd-kit/core';
import type { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  accent?: 'indigo' | 'emerald';
}

export default function TaskColumn({ id, title, tasks, accent = 'indigo' }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const areaClass = accent === 'emerald' ? 'from-white to-emerald-50/60' : 'from-white to-indigo-50/60';

  return (
    <div className="flex flex-col space-y-3 h-full min-h-0" data-column-id={id}>
      <h2 className="text-2xl font-bold text-slate-800 text-center">{title}</h2>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 bg-gradient-to-br ${areaClass} rounded-3xl p-4 sm:p-5 shadow-inner h-full flex flex-wrap justify-center content-start items-start border border-white/70 overflow-y-auto overflow-x-hidden card-grid-flex`}
      >
        {tasks.map(task => (
          <div key={task.id} className="card-cell">
            <TaskCard task={task} />
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="card-cell w-full text-center text-sm text-slate-400 py-10">
            {id === 'todo-column'
              ? 'No tasks to do—nice work! 🎉'
              : 'Done is empty... get those tasks done! 😅'}
          </div>
        )}
      </div>
    </div>
  );
}
