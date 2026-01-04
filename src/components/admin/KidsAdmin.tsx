import { useState } from 'react';
import { getKids, addKid, updateKid, deleteKid } from '../../storage';
import type { Kid } from '../../types';
import KidForm from './KidForm';
import ConfirmDialog from './ConfirmDialog';

export default function KidsAdmin() {
  const [kids, setKids] = useState(getKids());
  const [editingKid, setEditingKid] = useState<Kid | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingKid, setDeletingKid] = useState<Kid | null>(null);

  const refreshKids = () => setKids(getKids());

  const handleAdd = () => {
    setEditingKid(null);
    setShowForm(true);
  };

  const handleEdit = (kid: Kid) => {
    setEditingKid(kid);
    setShowForm(true);
  };

  const handleDelete = (kid: Kid) => {
    setDeletingKid(kid);
  };

  const confirmDelete = () => {
    if (deletingKid) {
      deleteKid(deletingKid.id);
      refreshKids();
      setDeletingKid(null);
    }
  };

  const handleFormSubmit = (kidData: Omit<Kid, 'id'>) => {
    if (editingKid) {
      updateKid(editingKid.id, kidData);
    } else {
      addKid(kidData);
    }
    refreshKids();
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Kids</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Kid
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kids.map(kid => (
          <div key={kid.id} className="p-4 rounded-xl flex items-center justify-between bg-white border border-gray-100 shadow-sm hover:shadow transition">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: kid.color }}
              >
                {kid.photoDataUrl ? (
                  <img src={kid.photoDataUrl} alt={kid.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  kid.name[0]
                )}
              </div>
              <div>
                <h3 className="font-medium">{kid.name}</h3>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleEdit(kid)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(kid)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <KidForm
          kid={editingKid}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      {deletingKid && (
        <ConfirmDialog
          message={`Are you sure you want to delete ${deletingKid.name}? This will also delete all their tasks.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingKid(null)}
        />
      )}
    </div>
  );
}
