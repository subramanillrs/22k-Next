/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: PHYSICAL ACOUSTIC GOLD COIN CHIME
 * Synthesizes resonant acoustic tone of 22K sovereign coin strike via Web Audio
 * ============================================================================
 */

(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.GoldAudio = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx && (typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext))) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Play high-resonance gold coin acoustic ping
   * Fundamental frequency of 8g Sovereign: ~5400Hz + overtone series with exponential decay
   */
  function playCoinChime(volume = 0.8) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primary ring oscillator
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(5420, now);
      osc1.frequency.exponentialRampToValueAtTime(5380, now + 1.2);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(volume * 0.4, now + 0.005);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Harmonic shimmer overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(10840, now);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(volume * 0.15, now + 0.003);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 1.25);
      osc2.stop(now + 0.85);
    } catch (e) {
      // Audio permission or unsupported context handled silently
    }
  }

  function haptic(ms = 10) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  return {
    playCoinChime,
    haptic
  };
});
