// Basic Web Animations API polyfill for browsers (like Safari 12) that lack Element.animate.
declare global {
  interface Element {
    animate?: typeof Element.prototype.animate;
  }
}

if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = function (keyframes: Keyframe[] | PropertyIndexedKeyframes | null, _options?: KeyframeAnimationOptions) {
    const element = this as HTMLElement;

    // Apply the final keyframe styles synchronously so animations still end in the expected state.
    if (Array.isArray(keyframes) && keyframes.length > 0) {
      const last = keyframes[keyframes.length - 1];
      if (last && typeof last === 'object') {
        Object.assign(element.style, last as Record<string, string>);
      }
    }

    const finished = Promise.resolve();
    const animationStub = {
      finished,
      playState: 'finished',
      cancel() {},
      finish() {},
      pause() {},
      play() {},
      reverse() {},
      onfinish: null,
      oncancel: null,
      addEventListener() {},
      removeEventListener() {},
    };

    return animationStub as unknown as Animation;
  };
}
