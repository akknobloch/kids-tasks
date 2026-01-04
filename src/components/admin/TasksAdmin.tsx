import { useEffect, useState } from 'react';
import { getKids, getTasks, addTask, updateTask, deleteTask, reorderTasks } from '../../storage';
import type { Task } from '../../types';
import TaskForm from './TaskForm';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem';
import KidSwitcher from '../KidSwitcher';

export default function TasksAdmin() {
  const [kids, setKids] = useState<Awaited<ReturnType<typeof getKids>>>([]);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);

  const selectedKid = kids.find(k => k.id === selectedKidId);
  const tasks = selectedKid ? allTasks.filter(t => t.kidId === selectedKid.id).sort((a, b) => a.order - b.order) : [];

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [k, t] = await Promise.all([getKids(), getTasks()]);
      if (!mounted) return;
      setKids(k);
      setAllTasks(t);
      setSelectedKidId(prev => prev && k.find(x => x.id === prev) ? prev : k[0]?.id || null);
    })();
    return () => { mounted = false; };
  }, []);

  const refreshTasks = async () => {
    const updated = await getTasks();
    setAllTasks(updated);
  };

  const handleAdd = () => {
    if (!selectedKid) return;
    setShowForm(true);
  };

  const handleDelete = async (task: Task) => {
    await deleteTask(task.id);
    await refreshTasks();
  };

  const handleToggleActive = async (task: Task) => {
    await updateTask(task.id, { isActive: !task.isActive });
    await refreshTasks();
  };

  const handleInlineUpdate = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    await refreshTasks();
  };

  const handleFormSubmit = async (taskData: Omit<Task, 'id'>) => {
    await addTask(taskData);
    await refreshTasks();
    setShowForm(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);

    const newTasks = [...tasks];
    const [moved] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, moved);

    await reorderTasks(selectedKid!.id, newTasks.map(t => t.id));
    await refreshTasks();
  };

  return (
    <div>
      <div className="mb-6">
        <KidSwitcher
          kids={kids}
          selectedKidId={selectedKidId}
          onSelectKid={setSelectedKidId}
          size="compact"
        />
      </div>
      {selectedKid && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Tasks for {selectedKid.name}</h2>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {tasks.map(task => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    onUpdate={handleInlineUpdate}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
      {showForm && selectedKid && (
        <TaskForm
          task={null}
          kidId={selectedKid.id}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
