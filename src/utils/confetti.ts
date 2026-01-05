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

  const colors = [primaryColor || '#22c55e', '#ffffff', '#fbbf24'];

  try {
    const shoot = confetti.create(canvas, { resize: false, useWorker: false });
    const common = {
      scalar: 0.65,
      ticks: 90,
      disableForReducedMotion: true,
      colors,
    };

    // Center burst
    shoot({
      ...common,
      particleCount: 40,
      spread: 110,
      startVelocity: 34,
      origin: { x: 0.5, y: 0.9 },
    });

    // Side bursts to fill width
    shoot({
      ...common,
      particleCount: 28,
      spread: 130,
      startVelocity: 30,
      origin: { x: 0.2, y: 0.9 },
      ticks: 80,
    });

    shoot({
      ...common,
      particleCount: 28,
      spread: 130,
      startVelocity: 30,
      origin: { x: 0.8, y: 0.9 },
      ticks: 80,
    });
  } catch (err) {
    console.warn('Confetti unavailable', err);
  } finally {
    window.setTimeout(() => {
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }, 1000);
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
