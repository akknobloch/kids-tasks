import { Routes, Route } from 'react-router-dom';
import { useDailyReset } from './hooks/useDailyReset';
import KidsView from './components/KidsView';
import AdminLayout from './components/admin/AdminLayout';
import './App.css';
import AuthGate from './components/AuthGate';

export function triggerCelebrationGif() {
  const existing = document.getElementById("celebration-gif");
  if (existing) existing.remove();

  const img = document.createElement("img");
  img.id = "celebration-gif";
  img.src =
    new URL("/celebrate.gif", import.meta.env.BASE_URL).toString() +
    "?v=" +
    Date.now();

  img.alt = "";
  img.style.position = "fixed";
  img.style.top = "16px";
  img.style.right = "16px";
  img.style.width = "120px";
  img.style.zIndex = "2147483647";
  img.style.pointerEvents = "none";

  img.style.opacity = "0";
  img.style.transform = "translateY(-10px)";
  img.style.transition = "transform 200ms ease, opacity 200ms ease";

  document.body.appendChild(img);

  requestAnimationFrame(() => {
    img.style.opacity = "1";
    img.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    img.style.opacity = "0";
    img.style.transform = "translateY(-10px)";
  }, 800);

  setTimeout(() => {
    img.remove();
  }, 1050);
}


function App() {
  useDailyReset();

  return (
    <AuthGate>
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 sm:space-y-6 h-screen">
          <button onClick={triggerCelebrationGif}>
  Test Celebration
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
