type ConfettiOptions = {
  colors?: string[];
  count?: number;
  origin?: { x: number; y: number };
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotVel: number;
  size: number;
  color: string;
};

export function launchConfetti(options: ConfettiOptions = {}) {
  if (typeof document === 'undefined') return;

  const {
    colors = ['#76c7c5', '#ffffff', '#7c3aed', '#fcd34d'],
    count = 80,
    origin = { x: 0.5, y: 0.5 },
  } = options;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';
  container.style.zIndex = '100000';

  document.body.appendChild(container);

  const particles: Particle[] = [];
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI) - (Math.PI / 2);
    const speed = 6 + Math.random() * 6;
    const size = 6 + Math.random() * 6;
    particles.push({
      x: origin.x * width,
      y: origin.y * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 4 + 4),
      rot: Math.random() * 360,
      rotVel: (Math.random() * 8 + 4) * (Math.random() > 0.5 ? 1 : -1),
      size,
      color: colors[i % colors.length],
    });
  }

  const elements = particles.map(p => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.width = `${p.size}px`;
    el.style.height = `${p.size * 1.6}px`;
    el.style.borderRadius = '2px';
    el.style.backgroundColor = p.color;
    el.style.willChange = 'transform';
    el.style.opacity = '0.95';
    container.appendChild(el);
    return el;
  });

  const gravity = 0.5;
  const drag = 0.995;
  const decay = 0.015;
  let frame = 0;

  function animate() {
    frame++;
    let active = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotVel;

      const life = Math.max(0, 1 - frame * decay);
      const el = elements[i];
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
      el.style.opacity = life.toString();

      if (p.y < height + 60 && life > 0.05) {
        active++;
      }
    }

    if (active > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(container);
    }
  }

  requestAnimationFrame(animate);
}
