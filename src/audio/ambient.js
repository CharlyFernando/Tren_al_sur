const DEFAULT_VOLUME = 0.4;

export function createAmbientAudio({ src, volume = DEFAULT_VOLUME } = {}) {
  const button = document.querySelector(".sound-toggle");

  let audio = null;
  let fadeId = 0;
  let playing = false;

  function ensureAudio() {
    if (audio) return audio;

    audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audio.volume = 0;
    audio.src = src;

    return audio;
  }

  function setPlaying(value) {
    playing = value;

    if (!button) return;
    button.dataset.playing = String(value);
    button.setAttribute("aria-pressed", String(value));
    button.setAttribute(
      "aria-label",
      value ? "Pausar sonido ambiental" : "Activar sonido ambiental"
    );
  }

  function fadeTo(target, duration) {
    cancelAnimationFrame(fadeId);

    const element = ensureAudio();
    const from = element.volume;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = progress * progress * (3 - 2 * progress);

      element.volume = Math.min(
        1,
        Math.max(0, from + (target - from) * eased)
      );

      if (progress < 1) {
        fadeId = requestAnimationFrame(step);
      } else if (target === 0) {
        element.pause();
      }
    };

    fadeId = requestAnimationFrame(step);
  }

  async function play() {
    if (playing) return;

    const element = ensureAudio();
    setPlaying(true);

    try {
      if (element.paused) await element.play();
      fadeTo(volume, 1600);
    } catch {
      setPlaying(false);
    }
  }

  function pause() {
    if (!playing) return;
    setPlaying(false);
    fadeTo(0, 600);
  }

  function toggle() {
    if (playing) pause();
    else play();
  }

  button?.addEventListener("click", toggle);

  setPlaying(false);

  return {
    play,
    pause,
    toggle,
    get playing() {
      return playing;
    },
  };
}
