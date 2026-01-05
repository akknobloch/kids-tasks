import { getCelebrationGifUrls, getRandomCelebrationGifUrl, preloadCelebrationGifs } from './celebrationGifs';

let activeGif: HTMLImageElement | null = null;
let hideTimer: number | null = null;
let removeTimer: number | null = null;
let stripEl: HTMLDivElement | null = null;
let stripHideTimer: number | null = null;
let stripRemoveTimer: number | null = null;
const TOP_OFFSET = '3.7rem';

export function triggerCelebrationGif() {
  preloadCelebrationGifs();

  // Respect reduced motion
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  // Clean restart if already visible
  if (activeGif) {
    if (hideTimer) window.clearTimeout(hideTimer);
    if (removeTimer) window.clearTimeout(removeTimer);
    activeGif.remove();
    activeGif = null;
  }

  const gifUrl = getRandomCelebrationGifUrl();
  if (!gifUrl) return;

  const img = document.createElement("img");
  img.src = gifUrl;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");

  // Positioning
  img.style.position = "fixed";
  img.style.top = TOP_OFFSET;
  img.style.right = "1rem";
  img.style.width = "200px";
  img.style.height = "auto";
  img.style.zIndex = "2147483647";
  img.style.pointerEvents = "none";

  // Entry state
  img.style.opacity = "0";
  img.style.transform = "translateY(-10px)";
  img.style.transition = "opacity 200ms ease, transform 200ms ease";
  img.style.willChange = "opacity, transform";

  document.body.appendChild(img);
  activeGif = img;

  // Enter
  requestAnimationFrame(() => {
    img.style.opacity = "1";
    img.style.transform = "translateY(0)";
  });

  // Exit
  hideTimer = window.setTimeout(() => {
    img.style.opacity = "0";
    img.style.transform = "translateY(-10px)";
  }, 5000);

  // Cleanup
  removeTimer = window.setTimeout(() => {
    if (activeGif) activeGif.remove();
    activeGif = null;
  }, 5300);
}

export function triggerFullBoardCelebration() {
  preloadCelebrationGifs();
  const urls = getCelebrationGifUrls();
  if (
    !urls.length ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    return;
  }

  // Clear existing strip if it's still visible
  if (stripEl) {
    stripEl.remove();
    stripEl = null;
  }
  if (stripHideTimer) {
    window.clearTimeout(stripHideTimer);
    stripHideTimer = null;
  }
  if (stripRemoveTimer) {
    window.clearTimeout(stripRemoveTimer);
    stripRemoveTimer = null;
  }

  const selection = shuffle(urls).slice(0, Math.min(5, urls.length));
  if (!selection.length) return;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.right = '0';
  container.style.top = TOP_OFFSET;
  container.style.display = 'flex';
  container.style.justifyContent = 'space-evenly';
  container.style.alignItems = 'flex-start';
  container.style.gap = '12px';
  container.style.padding = '0 10px';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '2147483647';
  container.style.opacity = '0';
  container.style.transform = 'translateY(-10px)';
  container.style.transition = 'opacity 220ms ease, transform 220ms ease';

  selection.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.flex = '1';
    img.style.maxWidth = '180px';
    img.style.minWidth = '90px';
    img.style.height = 'auto';
    img.style.borderRadius = '14px';
    img.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    img.style.background = 'white';
    img.style.objectFit = 'contain';
    img.style.aspectRatio = '3 / 4';
    container.appendChild(img);
  });

  document.body.appendChild(container);
  stripEl = container;

  requestAnimationFrame(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  });

  stripHideTimer = window.setTimeout(() => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
  }, 10000);

  stripRemoveTimer = window.setTimeout(() => {
    if (stripEl) stripEl.remove();
    stripEl = null;
  }, 10800);
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
