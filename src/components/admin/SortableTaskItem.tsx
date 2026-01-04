import { useEffect, useState, type ChangeEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import EmojiSelect from './EmojiSelect';

interface SortableTaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (task: Task) => void;
  onToggleActive: (task: Task) => void;
}

export default function SortableTaskItem({ task, onUpdate, onDelete, onToggleActive }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [iconType, setIconType] = useState<'emoji' | 'image'>(task.iconType);
  const [iconValue, setIconValue] = useState(task.iconValue);
  const [isActiveChecked, setIsActiveChecked] = useState(task.isActive);

  useEffect(() => {
    if (!isEditing) {
      setTitle(task.title);
      setIconType(task.iconType);
      setIconValue(task.iconValue);
      setIsActiveChecked(task.isActive);
    }
  }, [task, isEditing]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleIconUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setIconValue(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate(task.id, { title, iconType, iconValue, isActive: isActiveChecked });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(task.title);
    setIconType(task.iconType);
    setIconValue(task.iconValue);
    setIsActiveChecked(task.isActive);
  };

  useEffect(() => {
    if (!isEditing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditing, task]);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg shadow flex flex-col space-y-3 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <span className="sr-only">Active</span>
            <input
              type="checkbox"
              checked={task.isActive}
              onChange={() => onToggleActive(task)}
              className="h-5 w-5 rounded border-gray-300"
              style={{ accentColor: '#2563eb' }}
            />
          </label>
          <div {...attributes} {...listeners} className="cursor-grab text-gray-400 pt-0.5">
            ⋮⋮
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <>
              <div className="flex flex-wrap items-center wrap-spacing-3">
                <select
                  value={iconType}
                  onChange={(e) => setIconType(e.target.value as 'emoji' | 'image')}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="emoji">Emoji</option>
                  <option value="image">Image</option>
                </select>
              </div>
              {iconType === 'emoji' ? (
                <EmojiSelect value={iconValue} onChange={setIconValue} />
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="text-sm"
                  />
                  {iconValue && <img src={iconValue} alt="" className="w-8 h-8 rounded" />}
                </div>
              )}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-3 text-left w-full focus:outline-none"
            >
              <div className="text-2xl">
                {task.iconType === 'emoji' ? task.iconValue : <img src={task.iconValue} alt="" className="w-8 h-8" />}
              </div>
              <div className={`font-medium ${task.isActive ? 'text-gray-900' : 'line-through text-gray-500'}`}>
                {task.title}
              </div>
            </button>
          )}
        </div>
        <div className="flex flex-col justify-between items-end space-y-2">
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
            )}
            {!isEditing && (
              <button onClick={() => onDelete(task)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
            )}
          </div>
          {isEditing && (
            <div className="flex space-x-2">
              <button onClick={handleSave} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Save</button>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
