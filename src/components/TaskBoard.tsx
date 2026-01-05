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
import { fireCompletionConfetti } from '../utils/confetti';
import { triggerCelebration } from '../utils/celebration';

interface TaskBoardProps {
  kid: Kid;
  tasks: Task[];
  onTaskUpdate?: (id: string, updates: Partial<Task>) => void;
}

export default function TaskBoard({ kid, tasks, onTaskUpdate }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Small movement threshold helps Safari 12 detect drags quickly without accidental taps.
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 6,
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
      playChime();
      fireCompletionConfetti(kid.color);
      triggerCelebration('done-column');
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

let audioCtx: AudioContext | null = null;
let unlockListenerAttached = false;

function ensureAudioUnlock() {
  if (unlockListenerAttached || typeof window === 'undefined') return;
  unlockListenerAttached = true;
  const attempt = () => {
    if (!audioCtx) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtx = Ctx ? new Ctx() : null;
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended' && audioCtx.resume) {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(0);
    osc.stop(audioCtx.currentTime + 0.01);
    window.removeEventListener('pointerdown', attempt);
    window.removeEventListener('touchstart', attempt);
  };
  window.addEventListener('pointerdown', attempt, { once: true, passive: true });
  window.addEventListener('touchstart', attempt, { once: true, passive: true });
}

async function playChime() {
  try {
    if (!audioCtx) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtx = Ctx ? new Ctx() : null;
    }
    if (!audioCtx) return;

    const ctx = audioCtx;
    if (ctx.state === 'suspended' && ctx.resume) {
      await ctx.resume();
    }

    ensureAudioUnlock();

    const now = ctx.currentTime;
    const base = 523.25; // C5
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscC = ctx.createOscillator();
    const gain = ctx.createGain();

    oscA.type = 'triangle';
    oscB.type = 'triangle';
    oscC.type = 'square';

    // Arpeggiated C major: C5 -> E5 -> G5 with sparkle layer.
    oscA.frequency.setValueAtTime(base, now);
    oscB.frequency.setValueAtTime(base * 1.2599, now + 0.08); // E5
    oscC.frequency.setValueAtTime(base * 1.4983, now + 0.16); // G5

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    oscA.connect(gain);
    oscB.connect(gain);
    oscC.connect(gain);
    gain.connect(ctx.destination);

    oscA.start(now);
    oscB.start(now + 0.08);
    oscC.start(now + 0.16);
    oscA.stop(now + 0.6);
    oscB.stop(now + 0.6);
    oscC.stop(now + 0.6);
  } catch {
    // Safari 12 may block audio; fail quietly.
  }
}
