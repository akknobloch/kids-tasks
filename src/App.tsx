import { Routes, Route } from 'react-router-dom';
import { useDailyReset } from './hooks/useDailyReset';
import KidsView from './components/KidsView';
import AdminLayout from './components/admin/AdminLayout';
import './App.css';
import AuthGate from './components/AuthGate';

function App() {
  useDailyReset();

  return (
    <AuthGate>
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto p-12 space-y-6">
          <Routes>
            <Route path="/" element={<KidsView />} />
            <Route path="/admin/*" element={<AdminLayout />} />
          </Routes>
        </div>
      </div>
    </AuthGate>
  );
}

export default App;
