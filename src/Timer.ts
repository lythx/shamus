export class Timer {

  readonly startTimestamp: number
  readonly endTimestamp: number
  readonly totalDuration: number
  private isStopped: boolean = false
  onEnd: ((wasInterrupted: boolean) => unknown) | undefined
  onUpdate: (() => unknown) | undefined

  /**
   * @param duration time in msec
   */
  constructor(duration: number) {
    this.startTimestamp = Date.now()
    this.endTimestamp = this.startTimestamp + duration
    this.totalDuration = duration
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