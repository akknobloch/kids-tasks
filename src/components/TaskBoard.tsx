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
      spawnConfettiRain(kid.color);
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
    @keyframes confetti-rain {
      0% { transform: translate3d(0, -10px, 0) rotate(0deg); opacity: 0.95; }
      70% { transform: translate3d(-10px, 60vh, 0) rotate(180deg); opacity: 0.95; }
      100% { transform: translate3d(10px, 120vh, 0) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

let audioCtx: AudioContext | null = null;
let audioUnlocked = false;

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

    // Attempt to unlock audio on first call with a silent click.
    if (!audioUnlocked) {
      const unlockOsc = ctx.createOscillator();
      const unlockGain = ctx.createGain();
      unlockGain.gain.value = 0.0001;
      unlockOsc.connect(unlockGain).connect(ctx.destination);
      unlockOsc.start(0);
      unlockOsc.stop(ctx.currentTime + 0.01);
      audioUnlocked = true;
    }

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

function isOldSafari() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Version\/12\./.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium/.test(ua);
}

function spawnConfettiRain(color: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.inset = '0';
  container.style.zIndex = '9999';

  const colors = [color || '#22c55e', '#ffffff', '#fbbf24', '#a5b4fc'];
  const useJsFallback = isOldSafari();
  const pieces: HTMLElement[] = [];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    const size = 8 + Math.random() * 8;
    piece.style.position = 'absolute';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-10 - Math.random() * 20}%`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.4}px`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.opacity = '0.95';
    piece.style.borderRadius = '2px';
    if (useJsFallback) {
      piece.dataset.vy = (4 + Math.random() * 6).toString();
      piece.dataset.vx = (Math.random() * 4 - 2).toString();
      piece.dataset.rot = (Math.random() * 360).toString();
    } else {
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.animation = `confetti-rain ${900 + Math.random() * 900}ms cubic-bezier(0.25, 0.8, 0.25, 1) forwards`;
      piece.style.animationDelay = `${Math.random() * 150}ms`;
    }
    pieces.push(piece);
    container.appendChild(piece);
  }

  document.body.appendChild(container);

  if (useJsFallback) {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      for (const el of pieces) {
        const vy = Number(el.dataset.vy || '0');
        const vx = Number(el.dataset.vx || '0');
        const rot = Number(el.dataset.rot || '0');
        const top = parseFloat(el.style.top) || 0;
        const left = parseFloat(el.style.left) || 0;
        const newTop = top + vy * 0.6;
        const newLeft = left + vx * 0.6;
        const newRot = rot + 5;
        el.style.top = `${newTop}%`;
        el.style.left = `${newLeft}%`;
        el.style.transform = `rotate(${newRot}deg)`;
        el.dataset.rot = newRot.toString();
      }
      if (elapsed < 1600) {
        requestAnimationFrame(tick);
      } else {
        if (container.parentElement) container.parentElement.removeChild(container);
      }
    };
    requestAnimationFrame(tick);
  } else {
    setTimeout(() => {
      if (container.parentElement) container.parentElement.removeChild(container);
    }, 1800);
  }
}
