const celebrationGifImports = import.meta.glob(
  '../assets/celebrations/*.{gif,GIF}',
  { eager: true, as: 'url' },
);

const celebrationGifUrls = Object.values(celebrationGifImports) as string[];
let preloaded = false;

export function getCelebrationGifUrls() {
  return celebrationGifUrls;
}

export function getRandomCelebrationGifUrl() {
  if (!celebrationGifUrls.length) return null;
  const idx = Math.floor(Math.random() * celebrationGifUrls.length);
  return celebrationGifUrls[idx];
}

export function preloadCelebrationGifs() {
  if (preloaded || typeof Image === 'undefined' || !celebrationGifUrls.length) return;
  celebrationGifUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
  preloaded = true;
}
