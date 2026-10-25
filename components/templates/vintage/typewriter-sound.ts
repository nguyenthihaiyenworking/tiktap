export class TypewriterSound {
  private ctx: AudioContext
  private out: GainNode
  private noise: AudioBuffer

  constructor(ctx: AudioContext, volume = 0.45) {
    this.ctx = ctx
    this.out = ctx.createGain()
    this.out.gain.value = volume
    this.out.connect(ctx.destination)

    const length = Math.floor(ctx.sampleRate * 0.25)
    this.noise = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  }

  private burst(when: number, freq: number, q: number, peak: number, decay: number) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noise
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = q
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + decay)
    src.connect(filter).connect(gain).connect(this.out)
    src.start(when, Math.random() * 0.15, decay + 0.02)
  }

  private thump(when: number, freq: number, peak: number, decay: number) {
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, when)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, when + decay)
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + decay)
    osc.connect(gain).connect(this.out)
    osc.start(when)
    osc.stop(when + decay + 0.02)
  }

  key() {
    const t = this.ctx.currentTime
    const jitter = Math.random()
    this.burst(t, 2600 + jitter * 1800, 1.4, 0.9, 0.028 + jitter * 0.012)
    this.thump(t, 140 + jitter * 60, 0.5, 0.05)
    this.burst(t + 0.018 + jitter * 0.01, 5200, 3, 0.18, 0.015)
  }

  space() {
    const t = this.ctx.currentTime
    this.burst(t, 1400 + Math.random() * 400, 0.9, 0.7, 0.04)
    this.thump(t, 95, 0.6, 0.07)
  }

  carriageReturn(delay = 0) {
    const t = this.ctx.currentTime + delay
    for (const [freq, peak] of [
      [2093, 0.22],
      [3140, 0.1],
    ] as const) {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
      osc.connect(gain).connect(this.out)
      osc.start(t)
      osc.stop(t + 1.2)
    }
    for (let i = 0; i < 6; i++) {
      this.burst(t + 0.25 + i * 0.045, 900 + i * 120, 1.2, 0.25, 0.05)
    }
    this.burst(t + 0.55, 1800, 1, 0.8, 0.06)
    this.thump(t + 0.55, 110, 0.7, 0.09)
  }
}
