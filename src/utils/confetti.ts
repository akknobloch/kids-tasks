import confetti from 'canvas-confetti';

// Lightweight confetti burst for task completion. Falls back to a manual canvas
// animation for Safari 12 if canvas-confetti fails.
export function fireCompletionConfetti(primaryColor?: string) {
  if (shouldReduceMotion()) return;
  const colors = [primaryColor || '#22c55e', '#ffffff', '#fbbf24'];

  try {
    fireWithLibrary(colors);
  } catch (err) {
    // Safari 12 or other failures: use manual fallback.
    console.warn('Confetti unavailable, using fallback', err);
    fireFallback(colors);
  }
}

function shouldReduceMotion() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function fireWithLibrary(colors: string[]) {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth || 800;
  canvas.height = window.innerHeight || 600;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const shoot = confetti.create(canvas, { resize: false, useWorker: false });

  shoot({
    particleCount: 24,
    spread: 55,
    startVelocity: 26,
    scalar: 0.6,
    origin: { x: 0.5, y: 1 },
    ticks: 60,
    colors,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    shoot.reset?.();
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
  }, 850);
}

function fireFallback(colors: string[]) {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth || 800;
  canvas.height = window.innerHeight || 600;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) {
    canvas.remove();
    return;
  }
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const pieces = Array.from({ length: 26 }).map(() => ({
    x: canvas.width * 0.5,
    y: canvas.height,
    w: 4 + Math.random() * 3,
    h: 6 + Math.random() * 4,
    vx: (Math.random() * 2 - 1) * 0.9,
    vy: -(5 + Math.random() * 3),
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() * 4 - 2) * 0.04,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  const start = performance.now();
  const duration = 850;

  function frame(now: number) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    }
  }

  requestAnimationFrame(frame);
}
