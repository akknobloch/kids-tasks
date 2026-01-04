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
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 lg:py-12 space-y-4 sm:space-y-6 h-screen">
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
