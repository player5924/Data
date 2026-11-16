window.MG = window.MG || {};

MG.Audio = (() => {
  let ctx = null;
  let muted = false;

  function ensureContext() {
    if (muted) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(freq, dur = 0.12, type = 'sine', gainVal = 0.12, delay = 0) {
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  function playSpinStart() {
    tone(220, 0.08, 'triangle', 0.1, 0);
    tone(330, 0.1, 'triangle', 0.1, 0.05);
  }

  function playTileDrop() {
    tone(160, 0.06, 'sine', 0.08, 0);
    tone(210, 0.05, 'triangle', 0.05, 0.03);
  }

  function playWin(cascadeStep = 0) {
    const base = 440 * Math.pow(1.12, Math.min(cascadeStep, 5));
    tone(base, 0.14, 'triangle', 0.12, 0);
    tone(base * 1.25, 0.16, 'triangle', 0.12, 0.07);
    tone(base * 1.5, 0.24, 'sine', 0.14, 0.14);
  }

  function playGoldTransform() {
    tone(660, 0.18, 'sine', 0.13, 0);
    tone(880, 0.22, 'sine', 0.14, 0.06);
    tone(1320, 0.3, 'triangle', 0.11, 0.12);
  }

  function playMultiplierUp() {
    tone(523.25, 0.12, 'sawtooth', 0.06, 0);
    tone(783.99, 0.22, 'triangle', 0.1, 0.08);
  }

  function playScatterBonus() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => tone(n, 0.25, 'triangle', 0.14, idx * 0.09));
  }

  function setMuted(val) {
    muted = Boolean(val);
  }

  function isMuted() {
    return muted;
  }

  return {
    playSpinStart,
    playTileDrop,
    playWin,
    playGoldTransform,
    playMultiplierUp,
    playScatterBonus,
    setMuted,
    isMuted
  };
})();
