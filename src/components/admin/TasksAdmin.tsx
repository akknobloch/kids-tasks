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
  const kids = getKids();
  const [selectedKidId, setSelectedKidId] = useState<string | null>(kids[0]?.id || null);
  const [allTasks, setAllTasks] = useState<Task[]>(getTasks());
  const [showForm, setShowForm] = useState(false);

  const selectedKid = kids.find(k => k.id === selectedKidId);
  const tasks = selectedKid ? allTasks.filter(t => t.kidId === selectedKid.id).sort((a, b) => a.order - b.order) : [];

  useEffect(() => {
    if (!kids.length) {
      setSelectedKidId(null);
      return;
    }
    if (!selectedKidId || !kids.find(k => k.id === selectedKidId)) {
      setSelectedKidId(kids[0].id);
    }
  }, [kids, selectedKidId]);

  const refreshTasks = () => {
    setAllTasks(getTasks());
  };

  const handleAdd = () => {
    if (!selectedKid) return;
    setShowForm(true);
  };

  const handleDelete = (task: Task) => {
    deleteTask(task.id);
    refreshTasks();
  };

  const handleToggleActive = (task: Task) => {
    updateTask(task.id, { isActive: !task.isActive });
    refreshTasks();
  };

  const handleInlineUpdate = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
    refreshTasks();
  };

  const handleFormSubmit = (taskData: Omit<Task, 'id'>) => {
    addTask(taskData);
    refreshTasks();
    setShowForm(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);

    const newTasks = [...tasks];
    const [moved] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, moved);

    reorderTasks(selectedKid!.id, newTasks.map(t => t.id));
    refreshTasks();
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
