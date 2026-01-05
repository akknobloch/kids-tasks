import { useState } from 'react';
import { unlockAudioContext, isAudioUnlocked } from '../utils/audioUnlock';

export default function SoundUnlockButton() {
  const [enabled, setEnabled] = useState(isAudioUnlocked());

  const handleClick = () => {
    const ok = unlockAudioContext();
    if (ok) setEnabled(true);
  };

  if (enabled) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Enable sound"
      className="fixed top-4 right-4 bg-white/90 border border-slate-200 shadow-sm rounded-full px-3 py-2 text-lg leading-none hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
      style={{ zIndex: 20000 }}
    >
      🔊
    </button>
  );
}
