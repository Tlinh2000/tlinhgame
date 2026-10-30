// Hiệu ứng tổng hợp riêng của TlinhGame; chưa phải hệ thống nhạc nền.
export class AudioManager {
  private context: AudioContext | null = null;
  async playTest(volume: number, muted: boolean): Promise<void> {
    if (muted || volume <= 0) return;
    this.context ??= new AudioContext();
    await this.context.resume();
    const now = this.context.currentTime;
    for (const [index, frequency] of [523.25, 659.25, 783.99].entries()) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = now + index * 0.09;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(Math.min(1, volume) * 0.14, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.3);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
  }
  dispose(): void {
    if (this.context && this.context.state !== 'closed') void this.context.close();
    this.context = null;
  }
}
