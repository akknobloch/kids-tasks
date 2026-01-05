import confetti from 'canvas-confetti';

// Simple, Safari-12-friendly confetti burst for task completion.
// Uses a temporary canvas to avoid global side effects and cleans up afterward.
export function fireCompletionConfetti(primaryColor?: string) {
  if (shouldReduceMotion()) return;

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth || 800;
  canvas.height = window.innerHeight || 600;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  document.body.appendChild(canvas);

  try {
    const shoot = confetti.create(canvas, { resize: false, useWorker: false });
    shoot({
      particleCount: 24,
      spread: 55,
      startVelocity: 28,
      scalar: 0.6,
      origin: { x: 0.5, y: 1 },
      ticks: 60,
      colors: [primaryColor || '#22c55e', '#ffffff', '#fbbf24'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.warn('Confetti unavailable', err);
  } finally {
    window.setTimeout(() => {
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }, 900);
  }
}

function shouldReduceMotion() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  } catch {
    return false;
  }
}
