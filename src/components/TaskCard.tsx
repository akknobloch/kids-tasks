import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    touchAction: 'none',
    WebkitTouchCallout: 'none',
    ...(transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined),
  };

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      {...listeners}
      {...attributes}
      className={`w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 cursor-grab active:cursor-grabbing transition-transform border border-indigo-50 ${
        isDragging ? 'opacity-60 scale-105 rotate-1' : 'hover:-translate-y-1'
      }`}
    >
      <div className="text-3xl sm:text-4xl mb-2 drop-shadow-sm">
        {task.iconType === 'emoji' ? task.iconValue : <img src={task.iconValue} alt="" className="w-8 h-8" />}
      </div>
      <div className="text-sm text-center font-bold text-slate-700">{task.title}</div>
    </div>
  );
}
