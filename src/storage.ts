import type { Kid, Task } from './types';

const STORAGE_VERSION = 1;
const STORAGE_KEY = 'kids-tasks-data';
let memoryData: StorageData | null = null;

interface StorageData {
  version: number;
  kids: Kid[];
  tasks: Task[];
  lastResetDate: string; // ISO date string
}

const defaultData: StorageData = {
  version: STORAGE_VERSION,
  kids: [
    {
      id: 'kid1',
      name: 'Alice',
      color: '#FF6B6B',
      photoDataUrl: '', // placeholder
    },
    {
      id: 'kid2',
      name: 'Bob',
      color: '#4ECDC4',
      photoDataUrl: '',
    },
  ],
  tasks: [
    { id: 'task1', kidId: 'kid1', title: 'Brush teeth', iconType: 'emoji', iconValue: '🪥', order: 1, isDone: false, isActive: true },
    { id: 'task2', kidId: 'kid1', title: 'Make bed', iconType: 'emoji', iconValue: '🛏️', order: 2, isDone: false, isActive: true },
    { id: 'task3', kidId: 'kid1', title: 'Eat breakfast', iconType: 'emoji', iconValue: '🥞', order: 3, isDone: false, isActive: true },
    { id: 'task4', kidId: 'kid1', title: 'Pack backpack', iconType: 'emoji', iconValue: '🎒', order: 4, isDone: false, isActive: true },
    { id: 'task5', kidId: 'kid1', title: 'Walk dog', iconType: 'emoji', iconValue: '🐕', order: 5, isDone: false, isActive: true },
    { id: 'task6', kidId: 'kid1', title: 'Do homework', iconType: 'emoji', iconValue: '📚', order: 6, isDone: false, isActive: true },
    { id: 'task7', kidId: 'kid2', title: 'Brush teeth', iconType: 'emoji', iconValue: '🪥', order: 1, isDone: false, isActive: true },
    { id: 'task8', kidId: 'kid2', title: 'Make bed', iconType: 'emoji', iconValue: '🛏️', order: 2, isDone: false, isActive: true },
    { id: 'task9', kidId: 'kid2', title: 'Eat breakfast', iconType: 'emoji', iconValue: '🥞', order: 3, isDone: false, isActive: true },
    { id: 'task10', kidId: 'kid2', title: 'Pack backpack', iconType: 'emoji', iconValue: '🎒', order: 4, isDone: false, isActive: true },
    { id: 'task11', kidId: 'kid2', title: 'Walk dog', iconType: 'emoji', iconValue: '🐕', order: 5, isDone: false, isActive: true },
    { id: 'task12', kidId: 'kid2', title: 'Do homework', iconType: 'emoji', iconValue: '📚', order: 6, isDone: false, isActive: true },
  ],
  lastResetDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
};

function cloneData(data: StorageData): StorageData {
  return JSON.parse(JSON.stringify(data));
}

function readFromStorage(): StorageData | null {
  try {
    const stored = typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null;

  return stored ? JSON.parse(stored) : memoryData;
  } catch (err) {
    console.warn('localStorage read failed; using in-memory data', err);
    return memoryData;
  }
}

function writeToStorage(data: StorageData) {
  memoryData = cloneData(data);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.warn('localStorage write failed; retaining in-memory data only', err);
  }
}

function loadData(): StorageData {
  const stored = readFromStorage();
  if (!stored || stored.version !== STORAGE_VERSION) {
    writeToStorage(defaultData);
    return cloneData(defaultData);
  }
  return stored;
}

function saveData(data: StorageData) {
  writeToStorage(data);
}

export function getKids(): Kid[] {
  return loadData().kids;
}

export function getTasks(): Task[] {
  return loadData().tasks;
}

export function addKid(kid: Omit<Kid, 'id'>): Kid {
  const data = loadData();
  const newKid: Kid = { ...kid, id: `kid${Date.now()}` };
  data.kids.push(newKid);
  saveData(data);
  return newKid;
}

export function updateKid(id: string, updates: Partial<Kid>): Kid | null {
  const data = loadData();
  const kidIndex = data.kids.findIndex(k => k.id === id);
  if (kidIndex === -1) return null;
  data.kids[kidIndex] = { ...data.kids[kidIndex], ...updates };
  saveData(data);
  return data.kids[kidIndex];
}

export function deleteKid(id: string): boolean {
  const data = loadData();
  const kidIndex = data.kids.findIndex(k => k.id === id);
  if (kidIndex === -1) return false;
  data.kids.splice(kidIndex, 1);
  // Also delete tasks for this kid
  data.tasks = data.tasks.filter(t => t.kidId !== id);
  saveData(data);
  return true;
}

export function addTask(task: Omit<Task, 'id'>): Task {
  const data = loadData();
  const newTask: Task = { ...task, id: `task${Date.now()}` };
  data.tasks.push(newTask);
  saveData(data);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const data = loadData();
  const taskIndex = data.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return null;
  data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
  saveData(data);
  return data.tasks[taskIndex];
}

export function deleteTask(id: string): boolean {
  const data = loadData();
  const taskIndex = data.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return false;
  data.tasks.splice(taskIndex, 1);
  saveData(data);
  return true;
}

export function reorderTasks(kidId: string, taskIds: string[]): void {
  const data = loadData();
  const tasks = data.tasks.filter(t => t.kidId === kidId);
  taskIds.forEach((id, index) => {
    const task = tasks.find(t => t.id === id);
    if (task) task.order = index + 1;
  });
  saveData(data);
}

export function resetTasksIfNeeded(): void {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  if (data.lastResetDate !== today) {
    data.tasks.forEach(t => t.isDone = false);
    data.lastResetDate = today;
    saveData(data);
  }
}
