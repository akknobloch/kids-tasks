const MINION_SRC = '/minion.png';
let preloaded = false;
let overlay: HTMLDivElement | null = null;
let timeouts: number[] = [];
let cleanupTimer: number | null = null;

function preloadMinion() {
  if (preloaded || typeof Image === 'undefined') return;
  const img = new Image();
  img.src = MINION_SRC;
  preloaded = true;
}

function clearTimers() {
  timeouts.forEach(t => window.clearTimeout(t));
  timeouts = [];
  if (cleanupTimer) {
    window.clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }
}

function ensureStyles() {
  if (document.getElementById('minion-flood-style')) return;
  const style = document.createElement('style');
  style.id = 'minion-flood-style';
  style.textContent = `
    @keyframes minion-shake {
      0% { transform: translate(0, 0) rotate(0deg); }
      20% { transform: translate(-6px, 4px) rotate(-1deg); }
      40% { transform: translate(5px, -5px) rotate(1deg); }
      60% { transform: translate(-4px, 3px) rotate(-1deg); }
      80% { transform: translate(4px, -4px) rotate(1deg); }
      100% { transform: translate(0, 0) rotate(0deg); }
    }
  `;
  document.head.appendChild(style);
}

export function triggerMinionFlood() {
  if (typeof document === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  preloadMinion();
  ensureStyles();
  clearTimers();

  if (overlay) {
    overlay.remove();
    overlay = null;
  }

  const baseSize = Math.max(80, Math.min(150, Math.floor(window.innerWidth / 8)));
  const size = Math.max(60, Math.floor(baseSize * 0.82)); // base minion size
  const step = Math.max(40, Math.floor(size * 0.72)); // tighter step to force overlap
  const cols = Math.max(1, Math.ceil(window.innerWidth / step));
  const rows = Math.max(1, Math.ceil(window.innerHeight / step));

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.overflow = 'hidden';
  container.style.zIndex = '2147483647';
  container.style.pointerEvents = 'none';
  container.style.background = 'transparent';
  container.style.opacity = '1';

  document.body.appendChild(container);
  overlay = container;

  const positions: number[] = [];
  const total = rows * cols;
  for (let i = 0; i < total; i++) positions.push(i);

  // Shuffle to make the fill feel organic.
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = positions[i];
    positions[i] = positions[j];
    positions[j] = tmp;
  }

  let delay = 540;
  let placed = 0;

  const placeNext = () => {
    if (!overlay) return;
    const pos = positions[placed];
    const col = (pos % cols);
    const row = Math.floor(pos / cols);
    const jitterX = Math.random() * 20 - 10;
    const jitterY = Math.random() * 20 - 10;
    const left = col * step + jitterX;
    const top = row * step + jitterY;

    const cell = document.createElement('div');
    cell.style.position = 'absolute';
    cell.style.left = `${left}px`;
    cell.style.top = `${top}px`;
    cell.style.width = `${size}px`;
    cell.style.height = `${size}px`;
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.opacity = '0';
    cell.style.transform = 'translateY(14px)';
    cell.style.transition = 'opacity 220ms ease, transform 220ms ease';

    const img = document.createElement('img');
    img.src = MINION_SRC;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.width = '165%';
    img.style.height = '165%';
    img.style.transform = 'translate(-26%, -26%)';
    img.style.objectFit = 'contain';
    img.style.userSelect = 'none';

    cell.appendChild(img);

    overlay.appendChild(cell);

    requestAnimationFrame(() => {
      cell.style.opacity = '1';
      cell.style.transform = 'translateY(0)';
    });

    placed += 1;
    if (placed >= total) {
      // After a short pause, slide everyone down and fade out.
      timeouts.push(window.setTimeout(() => {
        if (!overlay) return;
        const children = Array.from(overlay.children) as HTMLElement[];
        children.forEach((child, idx) => {
          child.style.transition = 'transform 520ms ease-in, opacity 520ms ease-in';
          child.style.transitionDelay = `${Math.min(160, idx * 8)}ms`;
          child.style.transform = 'translateY(100vh)';
          child.style.opacity = '0';
        });
        cleanupTimer = window.setTimeout(() => {
          if (overlay) overlay.remove();
          overlay = null;
        }, 1100);
      }, 2000));
      return;
    }

    delay = Math.max(28, Math.floor(delay * 0.74));
    timeouts.push(window.setTimeout(placeNext, delay));
  };

  placeNext();
}
