// Lightweight Web Audio API sound effects (zero external audio files needed)
class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay = 0,
    gainVal = 0.12
  ) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(540, 0.07, 'triangle', 0, 0.08);
  }

  playCorrect() {
    this.playTone(523.25, 0.14, 'triangle', 0, 0.14); // C5
    this.playTone(659.25, 0.16, 'triangle', 0.09, 0.14); // E5
    this.playTone(783.99, 0.24, 'triangle', 0.18, 0.15); // G5
  }

  playWrong() {
    this.playTone(310, 0.16, 'sine', 0, 0.1);
    this.playTone(255, 0.22, 'sine', 0.12, 0.1);
  }

  playStageComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.playTone(n, 0.22, 'triangle', i * 0.1, 0.14));
  }

  playVictory() {
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.playTone(n, 0.28, 'triangle', i * 0.11, 0.16));
  }
}

export const soundEngine = new SoundEngine();

export function speakVietnamese(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN';
    utter.rate = 0.96;
    utter.pitch = 1.08;
    window.speechSynthesis.speak(utter);
  } catch {
    // Graceful no-op if speech synthesis unavailable
  }
}
