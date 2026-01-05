// Celebration helper: shows a GIF overlay or a reduced-motion pulse.
const GIF_PATH = '/celebration.gif';

let preloadImg: HTMLImageElement | null = null;
let overlayEl: HTMLDivElement | null = null;
let hideTimer: number | null = null;
let removeTimer: number | null = null;
let pulseTimer: number | null = null;
let gifUrlCache: string | null = null;

function getGifUrl() {
  if (gifUrlCache) return gifUrlCache;
  if (typeof window !== 'undefined') {
    gifUrlCache = `${window.location.origin}${GIF_PATH}`;
  } else {
    gifUrlCache = GIF_PATH;
  }
  return gifUrlCache;
}

export function primeCelebration() {
  if (preloadImg) return;
  preloadImg = new Image();
  preloadImg.src = getGifUrl();
}

export function triggerCelebration(doneColumnId = 'done-column') {
  primeCelebration();

  if (shouldReduceMotion()) {
    pulseDoneColumn(doneColumnId);
    return;
  }

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (removeTimer) {
    clearTimeout(removeTimer);
    removeTimer = null;
  }
  if (overlayEl && overlayEl.parentElement) {
    overlayEl.parentElement.removeChild(overlayEl);
  }

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.right = '18px';
  overlay.style.bottom = '18px';
  overlay.style.width = '220px';
  overlay.style.height = '300px';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '10000';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'flex-end';
  overlay.style.justifyContent = 'flex-end';
  overlay.style.transform = 'translateY(20px)';
  overlay.style.opacity = '0';
  overlay.style.transition = 'transform 220ms ease, opacity 220ms ease';

  const img = document.createElement('img');
  img.src = getGifUrl();
  img.alt = '';
  img.style.width = '100%';
  img.style.height = 'auto';
  img.style.borderRadius = '16px';
  img.onerror = () => {
    // Fallback visual if GIF fails to load (e.g., Safari fetch issue)
    img.remove();
    overlay.style.background = '#fef3c7';
    overlay.style.borderRadius = '16px';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '32px';
    overlay.textContent = '🎉';
  };

  overlay.appendChild(img);

  document.body.appendChild(overlay);
  overlayEl = overlay;

  requestAnimationFrame(() => {
    overlay.style.transform = 'translateY(0)';
    overlay.style.opacity = '1';
  });

  hideTimer = window.setTimeout(() => {
    overlay.style.transform = 'translateY(30px)';
    overlay.style.opacity = '0';
  }, 4800);

  removeTimer = window.setTimeout(() => {
    if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
    if (overlayEl === overlay) overlayEl = null;
  }, 5200);
}

function pulseDoneColumn(doneColumnId: string) {
  if (pulseTimer) {
    clearTimeout(pulseTimer);
    pulseTimer = null;
  }
  const el = document.querySelector<HTMLElement>(`[data-column-id="${doneColumnId}"]`);
  if (!el) return;
  el.classList.add('done-pulse');
  pulseTimer = window.setTimeout(() => {
    el.classList.remove('done-pulse');
    pulseTimer = null;
  }, 400);
}

function shouldReduceMotion() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
