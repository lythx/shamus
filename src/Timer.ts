export class Timer {

  readonly startTimestamp: number
  endTimestamp: number
  readonly totalDuration: number
  private savedRemainingTime: number = 0
  isPaused = false
  private isStopped: boolean = false
  onEnd: ((wasInterrupted: boolean) => unknown) | undefined
  onUpdate: (() => unknown) | undefined
  static timers: Timer[] = []

  /**
   * @param duration time in msec
   */
  constructor(duration: number) {
    this.startTimestamp = Date.now()
    this.endTimestamp = this.startTimestamp + duration
    this.totalDuration = duration
    this.cycle()
    Timer.timers.push(this) // handle memory leak todo
  }

  static pause(): void {
    for (let i = 0; i < this.timers.length; i++) {
      this.timers[i].pause()
    }
  }

  static resume(): void {
    for (let i = 0; i < this.timers.length; i++) {
      this.timers[i].resume()
    }
  }

  pause() {
    console.log('sus')
    this.savedRemainingTime = this.remainingTime
    this.isPaused = true
  }

  resume() {
    this.endTimestamp = Date.now() + this.savedRemainingTime
    this.isPaused = false
  }

  stop() {
    
    this.isStopped = true
  }

  get remainingTime(): number {
    const t = this.endTimestamp - Date.now()
    return t < 0 ? 0 : t
  }

  get passedTime(): number {
    const t = Date.now() - this.startTimestamp
    return this.endTimestamp > t ? t : this.endTimestamp
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
        return
      }
      this.onUpdate?.()
      requestAnimationFrame(callback)
    }
    requestAnimationFrame(callback)
  }

}