let unlocked = false;

export function unlockAudioContext() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = Ctx ? new Ctx() : null;
    if (!ctx) return false;
    if (ctx.state === 'suspended' && ctx.resume) {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(ctx.destination);
    osc.start(0);
    osc.stop(ctx.currentTime + 0.01);
    unlocked = true;
    return true;
  } catch {
    return false;
  }
}

export function isAudioUnlocked() {
  return unlocked;
}
