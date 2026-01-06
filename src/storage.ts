import type { Kid, Task, Streak } from './types';

const AUTH_TOKEN_KEY = 'kids-tasks-token';

function getToken() {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function api<T>(input: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(input, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function getKids(): Promise<Kid[]> {
  const data = await api<{ kids: Kid[] }>('/api/storage');
  return data.kids;
}

export async function getTasks(): Promise<Task[]> {
  const data = await api<{ tasks: Task[] }>('/api/storage');
  return data.tasks;
}

export async function addKid(kid: Omit<Kid, 'id'>): Promise<Kid> {
  return api<Kid>('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'addKid', payload: kid }),
  });
}

export async function updateKid(id: string, updates: Partial<Kid>): Promise<Kid | null> {
  return api<Kid>('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'updateKid', payload: { id, updates } }),
  });
}

export async function deleteKid(id: string): Promise<boolean> {
  await api('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'deleteKid', payload: { id } }),
  });
  return true;
}

export async function addTask(task: Omit<Task, 'id'>): Promise<Task> {
  return api<Task>('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'addTask', payload: task }),
  });
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  return api<Task>('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'updateTask', payload: { id, updates } }),
  });
}

export async function deleteTask(id: string): Promise<boolean> {
  await api('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'deleteTask', payload: { id } }),
  });
  return true;
}

export async function reorderTasks(kidId: string, taskIds: string[]): Promise<void> {
  await api('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'reorderTasks', payload: { kidId, taskIds } }),
  });
}

export async function resetTasksIfNeeded(): Promise<void> {
  await api('/api/storage', {
    method: 'POST',
    body: JSON.stringify({ action: 'resetTasksIfNeeded' }),
  });
}

export async function getStreaks(): Promise<Streak[]> {
  const data = await api<{ streaks: Streak[] }>('/api/storage');
  return data.streaks || [];
}
