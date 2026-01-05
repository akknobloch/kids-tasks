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
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 sm:space-y-6 h-screen">
          <button
  onClick={() => {
    const el = document.createElement("div");
    const img = new Image();
    img.onload = () => alert("GIF loaded: " + img.naturalWidth + "x" + img.naturalHeight);
    img.onerror = () => alert("GIF failed to load");
    img.src = "/celebrate.gif"; // must be in /public
    el.textContent = "CELEBRATE";
    el.style.position = "fixed";
    el.style.left = "16px";
    el.style.top = "16px";
    el.style.zIndex = "2147483647";
    el.style.background = "lime";
    el.style.color = "black";
    el.style.padding = "12px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }}
>
  Test overlay
</button>
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
