import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import KidsAdmin from './KidsAdmin';
import TasksAdmin from './TasksAdmin';

export default function AdminLayout() {
  const location = useLocation();
  const isAdminRoot = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <Link to="/" className="text-blue-600 hover:text-blue-800">Back to App</Link>
          </div>
        </div>
      </header>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <NavLink
              to="/admin/tasks"
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 ${
                  isActive || isAdminRoot ? 'border-indigo-500 text-indigo-700 font-semibold' : 'border-transparent hover:border-gray-300'
                }`
              }
            >
              Tasks
            </NavLink>
            <NavLink
              to="/admin/kids"
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 ${
                  isActive ? 'border-indigo-500 text-indigo-700 font-semibold' : 'border-transparent hover:border-gray-300'
                }`
              }
            >
              Kids
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="tasks" element={<TasksAdmin />} />
          <Route path="kids" element={<KidsAdmin />} />
          <Route path="/" element={<TasksAdmin />} />
        </Routes>
      </main>
    </div>
  );
}
