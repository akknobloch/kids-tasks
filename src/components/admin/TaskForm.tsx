import { useState } from 'react';
import type { Task } from '../../types';
import EmojiSelect from './EmojiSelect';

interface TaskFormProps {
  task: Task | null;
  kidId: string;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, kidId, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [iconType, setIconType] = useState<'emoji' | 'image'>(task?.iconType || 'emoji');
  const [iconValue, setIconValue] = useState(task?.iconValue || '');
  const [isActive, setIsActive] = useState(task?.isActive ?? true);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setIconValue(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = task?.order || 999; // Will be reordered
    onSubmit({ kidId, title, iconType, iconValue, order, isDone: false, isActive });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">{task ? 'Edit Task' : 'Add Task'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon Type</label>
            <select
              value={iconType}
              onChange={(e) => setIconType(e.target.value as 'emoji' | 'image')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="emoji">Emoji</option>
              <option value="image">Image</option>
            </select>
          </div>
          {iconType === 'emoji' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
              <EmojiSelect value={iconValue} onChange={setIconValue} />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="w-full"
              />
              {iconValue && (
                <img src={iconValue} alt="Icon" className="mt-2 w-8 h-8" />
              )}
            </div>
          )}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mr-2"
              />
              Active
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {task ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
