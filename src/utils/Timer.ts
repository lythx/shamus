export class Timer {

  startTimestamp: number = -1
  endTimestamp: number = -1
  static isStopped = false
  totalDuration: number = -1
  isStarted = false
  private savedRemainingTime: number = -1
  isPaused = false
  isStopped: boolean = false
  onEnd: ((wasInterrupted: boolean) => unknown) | undefined
  onUpdate: (() => unknown) | undefined
  static timers: Timer[] = []

  constructor() {
    Timer.timers.push(this)
  }

  static pause(): void {
    Timer.isStopped = true
    for (let i = 0; i < this.timers.length; i++) {
      this.timers[i].pause()
    }
  }

  static resume(): void {
    Timer.isStopped = false
    for (let i = 0; i < this.timers.length; i++) {
      this.timers[i].resume()
    }
  }

  start(duration: number) {
    this.startTimestamp = Date.now()
    this.endTimestamp = this.startTimestamp + duration
    this.totalDuration = duration
    this.cycle()
    this.isStarted = true
    if (Timer.isStopped) { this.pause() }
    return this
  }

  pause() {
    if (!this.isStarted) { return }
    this.savedRemainingTime = this.remainingTime
    this.isPaused = true
  }

  resume() {
    if (!this.isStarted) { return }
    this.endTimestamp = Date.now() + this.savedRemainingTime
    this.isPaused = false
    this.cycle()
  }

  stop() {
    this.isStopped = true
  }

  get remainingTime(): number {
    const t = this.endTimestamp - Date.now()
    return t < 0 ? 0 : t
  }

  get passedTime(): number {
    return this.totalDuration - this.remainingTime
  }

  get remainingTimeRatio(): number {
    return this.remainingTime / this.totalDuration
  }

  get passedTimeRatio(): number {
    return this.passedTime / this.totalDuration
  }

  private cycle() {
    const callback = () => {
      if (this.isPaused) { return }
      if (Date.now() > this.endTimestamp || this.isStopped) {
        this.onUpdate?.()
        this.onEnd?.(this.isStopped)
        this.onUpdate = undefined
        this.onEnd = undefined
        const index = Timer.timers.indexOf(this)
        if (index !== -1) {
          Timer.timers.splice(index, 1)
        }
        return
      }
      this.onUpdate?.()
      requestAnimationFrame(callback)
    }
    requestAnimationFrame(callback)
  }

}