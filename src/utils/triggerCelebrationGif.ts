import { getRandomCelebrationGifUrl, preloadCelebrationGifs } from './celebrationGifs';

let activeGif: HTMLImageElement | null = null;
let hideTimer: number | null = null;
let removeTimer: number | null = null;

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
  img.style.top = "3.7rem";
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
