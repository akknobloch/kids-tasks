let celebrationNode: HTMLImageElement | null = null;
let t1: number | null = null;
let t2: number | null = null;
let t3: number | null = null;

export function triggerCelebrationGif() {
  try {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
  } catch {
    // ignore errors reading media query
  }

  if (celebrationNode) {
    if (t1) clearTimeout(t1);
    if (t2) clearTimeout(t2);
    if (t3) clearTimeout(t3);
    celebrationNode.remove();
    celebrationNode = null;
  }

  const gifUrl = new URL('/celebrate.gif', import.meta.env.BASE_URL).toString();

  const img = document.createElement('img');
  img.src = gifUrl;
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');

  img.style.position = 'fixed';
  img.style.right = '18px';
  img.style.top = '18px';
  img.style.width = '160px';
  img.style.height = 'auto';
  img.style.transform = 'translateX(20px)';
  img.style.opacity = '0';
  img.style.zIndex = '2147483647';
  img.style.pointerEvents = 'none';
  img.style.transition = 'transform 220ms ease, opacity 220ms ease';
  img.style.willChange = 'transform, opacity';

  document.body.appendChild(img);
  celebrationNode = img;

  t1 = window.setTimeout(() => {
    img.style.opacity = '1';
    img.style.transform = 'translateX(0)';
  }, 0);

  t2 = window.setTimeout(() => {
    img.style.opacity = '0';
    img.style.transform = 'translateX(20px)';
  }, 4800);

  t3 = window.setTimeout(() => {
    if (celebrationNode) celebrationNode.remove();
    celebrationNode = null;
  }, 5200);
}
