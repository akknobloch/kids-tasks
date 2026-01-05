import confetti from 'canvas-confetti';

// Lightweight, Safari 12–friendly confetti burst for task completion.
export function fireCompletionConfetti(primaryColor?: string) {
  try {
    if (shouldReduceMotion()) return;

    // Create a one-off canvas instance for better compatibility with older Safari.
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const shoot = confetti.create(canvas, { resize: false, useWorker: false });

    shoot({
      particleCount: 32,
      spread: 60,
      startVelocity: 38,
      origin: { x: 0.5, y: 1 },
      ticks: 80,
      colors: [primaryColor || '#22c55e', '#ffffff', '#fbbf24'],
      disableForReducedMotion: true,
    });

    // Clean up the canvas shortly after the burst finishes.
    setTimeout(() => {
      shoot.reset?.();
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }, 900);
  } catch (err) {
    // Fail silently on unsupported environments.
    console.warn('Confetti unavailable', err);
  }
}

function shouldReduceMotion() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
