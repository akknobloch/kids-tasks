import { useMemo, useState } from 'react';
import type { Kid } from '../../types';

interface KidFormProps {
  kid: Kid | null;
  onSubmit: (kid: Omit<Kid, 'id'>) => void;
  onCancel: () => void;
}

export default function KidForm({ kid, onSubmit, onCancel }: KidFormProps) {
  const [name, setName] = useState(kid?.name || '');
  const [color, setColor] = useState(kid?.color || '#ef4444');
  const [photoDataUrl, setPhotoDataUrl] = useState(kid?.photoDataUrl || '');

  const tailwindPalette = useMemo(
    () => [
      '#ef4444', // red-500
      '#f97316', // orange-500
      '#f59e0b', // amber-500
      '#eab308', // yellow-500
      '#84cc16', // lime-500
      '#22c55e', // green-500
      '#10b981', // emerald-500
      '#14b8a6', // teal-500
      '#06b6d4', // cyan-500
      '#0ea5e9', // sky-500
      '#3b82f6', // blue-500
      '#6366f1', // indigo-500
      '#a855f7', // purple-500
      '#d946ef', // fuchsia-500
      '#ec4899', // pink-500
      '#f43f5e', // rose-500
    ],
    []
  );

  const paletteWithCurrent = useMemo(() => {
    if (!color || tailwindPalette.includes(color)) return tailwindPalette;
    return [color, ...tailwindPalette];
  }, [color, tailwindPalette]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, color, photoDataUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">{kid ? 'Edit Kid' : 'Add Kid'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {paletteWithCurrent.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={`h-10 w-full rounded-md border-2 transition ${
                    color === swatch ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' : 'border-white shadow-sm'
                  }`}
                  style={{ backgroundColor: swatch }}
                  aria-label={`Select color ${swatch}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">Colors pulled from Tailwind defaults.</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full"
            />
            {photoDataUrl && (
              <img src={photoDataUrl} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover" />
            )}
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
              {kid ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
