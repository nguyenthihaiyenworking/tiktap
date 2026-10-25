export class PenScratchSound {
  private ctx: AudioContext | null = null
  private noise: AudioBuffer | null = null
  private gainNode: GainNode | null = null

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    try {
      this.gainNode = ctx.createGain()
      this.gainNode.gain.value = 0.09 // Âm lượng nhè nhẹ, không lấn át nhạc nền
      this.gainNode.connect(ctx.destination)

      // Tạo buffer nhiễu trắng ngắn
      const sampleRate = ctx.sampleRate
      const length = Math.floor(sampleRate * 0.1)
      this.noise = ctx.createBuffer(1, length, sampleRate)
      const data = this.noise.getChannelData(0)
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1
      }
    } catch {
      // Bỏ qua nếu trình duyệt chặn audio
    }
  }

  // Phát tiếng ngòi bút cọ sột soạt nhẹ trên giấy
  scratch() {
    if (!this.ctx || !this.noise || !this.gainNode) return
    try {
      const now = this.ctx.currentTime
      const src = this.ctx.createBufferSource()
      src.buffer = this.noise

      // Bộ lọc dải tần ngòi bút ma sát giấy kraft (3000Hz - 5200Hz)
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 3600 + Math.random() * 1200
      filter.Q.value = 1.8

      const strokeGain = this.ctx.createGain()
      const duration = 0.035 + Math.random() * 0.02
      strokeGain.gain.setValueAtTime(0.001, now)
      strokeGain.gain.linearRampToValueAtTime(0.07, now + 0.006)
      strokeGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      src.connect(filter).connect(strokeGain).connect(this.gainNode)
      src.start(now)
      src.stop(now + duration + 0.01)
    } catch {
      // Im lặng nếu có lỗi
    }
  }
}
