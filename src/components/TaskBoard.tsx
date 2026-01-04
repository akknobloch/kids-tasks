import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Kid, Task } from '../types';
import { updateTask } from '../storage';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  kid: Kid;
  tasks: Task[];
  onTaskUpdate?: (id: string, updates: Partial<Task>) => void;
}

export default function TaskBoard({ kid, tasks, onTaskUpdate }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 75,
        tolerance: 8,
      },
    }),
  );

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  const todoTasks = taskList.filter(t => !t.isDone).sort((a, b) => a.order - b.order);
  const doneTasks = taskList.filter(t => t.isDone).sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    const task = taskList.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const task = taskList.find(t => t.id === taskId);

    if (!task) return;

    if (overId === 'done-column' && !task.isDone) {
      // Moved to done
      await updateTask(taskId, { isDone: true });
      setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, isDone: true } : t));
      onTaskUpdate?.(taskId, { isDone: true });
      fireConfetti(kid.color);
    }

    if (overId === 'todo-column' && task.isDone) {
      // Moved back to todo
      await updateTask(taskId, { isDone: false });
      setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, isDone: false } : t));
      onTaskUpdate?.(taskId, { isDone: false });
      rainEmojis('😭', kid.color);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full min-h-0">
        <div className="soft-card rounded-3xl p-3 sm:p-4 flex-1 min-h-0 flex flex-col">
          <div className="h-full min-h-0 flex flex-col sm:flex-row space-y-6 sm:space-y-0 items-stretch relative">
            <div className="h-full min-h-0 w-full sm:w-1/2 sm:px-3">
              <TaskColumn id="todo-column" title="To Do" tasks={todoTasks} accent="indigo" />
            </div>
            <div className="h-full min-h-0 w-full sm:w-1/2 sm:px-3">
              <TaskColumn id="done-column" title="Done" tasks={doneTasks} accent="emerald" />
            </div>
            <div className="hidden sm:block absolute inset-y-0 left-1/2 -translate-x-1/2 pointer-events-none px-3">
              <div className="h-full flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/80 shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 text-lg">
                  →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function rainEmojis(emoji: string, tint: string) {
  ensureEmojiStyles();
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.inset = '0';
  container.style.zIndex = '9999';

  for (let i = 0; i < 30; i++) {
    const span = document.createElement('span');
    span.textContent = emoji;
    span.style.position = 'absolute';
    span.style.left = `${Math.random() * 100}%`;
    span.style.top = '-5%';
    span.style.fontSize = `${20 + Math.random() * 14}px`;
    span.style.animation = `emoji-fall ${1200 + Math.random() * 800}ms linear`;
    span.style.filter = `drop-shadow(0 0 4px ${tint})`;
    container.appendChild(span);
  }

  document.body.appendChild(container);
  setTimeout(() => {
    document.body.removeChild(container);
  }, 2200);
}

function ensureEmojiStyles() {
  if (document.getElementById('emoji-fall-style')) return;
  const style = document.createElement('style');
  style.id = 'emoji-fall-style';
  style.textContent = `
    @keyframes emoji-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(20deg); opacity: 0.7; }
    }
  `;
  document.head.appendChild(style);
}

function fireConfetti(color: string) {
  simpleConfettiFallback(color);
}

function simpleConfettiFallback(color: string) {
  ensureConfettiStyles();
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 6;
    const endX = -40 + Math.random() * 80; // random drift
    const startRot = Math.random() * 180;
    const midRot = startRot + (Math.random() * 180 + 90);
    const endRot = midRot + (Math.random() * 180 + 120);

    piece.style.backgroundColor = i % 3 === 0 ? '#ffffff' : color;
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-10 - Math.random() * 10}%`;
    piece.style.animationDelay = `${Math.random() * 150}ms`;
    piece.style.animationDuration = `${900 + Math.random() * 700}ms`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.6}px`;
    piece.style.setProperty('--driftX', `${endX}px`);
    piece.style.setProperty('--rotStart', `${startRot}deg`);
    piece.style.setProperty('--rotMid', `${midRot}deg`);
    piece.style.setProperty('--rotEnd', `${endRot}deg`);
    container.appendChild(piece);
  }

  document.body.appendChild(container);
  setTimeout(() => {
    document.body.removeChild(container);
  }, 1700);
}

function ensureConfettiStyles() {
  if (document.getElementById('confetti-fallback-style')) return;
  const style = document.createElement('style');
  style.id = 'confetti-fallback-style';
  style.textContent = `
    .confetti-piece {
      position: absolute;
      width: 8px;
      height: 14px;
      border-radius: 2px;
      opacity: 0.9;
      animation-name: confetti-fall;
      animation-timing-function: cubic-bezier(0.21, 0.61, 0.35, 1);
      animation-fill-mode: forwards;
      transform-origin: center;
    }
    @keyframes confetti-fall {
      0% { transform: translate3d(0, 0, 0) rotate(var(--rotStart, 0deg)) scale(0.9); opacity: 0.98; }
      65% { transform: translate3d(calc(var(--driftX, 10px) * 0.6), 55vh, 0) rotate(var(--rotMid, 140deg)) scale(1); opacity: 0.98; }
      100% { transform: translate3d(calc(var(--driftX, 10px)), 120vh, 0) rotate(var(--rotEnd, 280deg)) scale(0.95); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
