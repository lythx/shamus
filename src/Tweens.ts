import config from "./config"
import { Timer } from "./Timer"
import { Point, Vector } from "./Utils"

export class LinearTween {

  private readonly timer: Timer
  private readonly vector: Vector
  private _currentPosition: Point
  onUpdate: ((currentPosition: Readonly<Point>) => unknown) | undefined

  constructor(start: Point, end: Point, speed: number) {
    this.timer = new Timer(speed * config.speedMultiplier)
    this.vector = new Vector(start, end)
    this._currentPosition = start
    this.timer.onUpdate = () => {
      const length = this.vector.length * this.timer.passedTimeRatio
      this._currentPosition = Vector.from(this.vector, length).b
      this.onUpdate?.(this._currentPosition)
    }
  }

  get currentPosition(): Readonly<Point> {
    return this._currentPosition
  }

  get remainingTime(): number {
    return this.timer.remainingTime
  }

  get passedTime(): number {
    return this.timer.passedTime
  }

  get remainingTimeRatio(): number {
    return this.timer.remainingTimeRatio
  }

  get passedTimeRatio(): number {
    return this.timer.passedTimeRatio
  }

  stop() {
    this.timer.stop()
    this.onUpdate = undefined
  }

}