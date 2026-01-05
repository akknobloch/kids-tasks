let activeGif: HTMLImageElement | null = null;
let hideTimer: number | null = null;
let removeTimer: number | null = null;

export function triggerCelebrationGif() {
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

  const img = document.createElement("img");
  img.src = window.location.origin + "/celebration.gif";
  img.alt = "";
  img.setAttribute("aria-hidden", "true");

  // Positioning (defaults to top-right; if task board is present, align above it)
  img.style.position = "fixed";
  const target = document.querySelector<HTMLElement>('[data-task-board-root]');
  const width = 200;
  const height = 120;
  if (target) {
    const rect = target.getBoundingClientRect();
    const top = Math.max(8, rect.top - height - 12);
    const left = Math.min(
      window.innerWidth - width - 8,
      Math.max(8, rect.right - width - 8)
    );
    img.style.top = `${top}px`;
    img.style.left = `${left}px`;
  } else {
    img.style.top = "3.7rem";
    img.style.right = "1rem";
  }
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
