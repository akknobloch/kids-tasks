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
  img.alt = "";

  // Use absolute URL to avoid base path issues
  img.src = window.location.origin + "/celebrate.gif?v=" + Date.now();

  // Hard-force visibility
  img.style.position = "fixed";
  img.style.top = "16px";
  img.style.right = "16px";
  img.style.width = "120px";
  img.style.height = "120px";
  img.style.zIndex = "2147483647";
  img.style.pointerEvents = "none";
  img.style.opacity = "1";
  img.style.transform = "none";
  img.style.display = "block";
  img.style.visibility = "visible";
  img.style.background = "magenta"; // debug
  img.style.border = "4px solid yellow"; // debug

  document.body.appendChild(img);

  img.onload = () => console.log("GIF loaded", img.naturalWidth, img.naturalHeight);
  img.onerror = () => console.log("GIF failed");

  // setTimeout(() => img.remove(), 2000);
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
