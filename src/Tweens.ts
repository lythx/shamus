import { config } from "./config.js"
import { Timer } from "./Timer.js"
import { Point, Vector } from "./Utils.js"

export class LinearTween {

  private readonly timer: Timer
  readonly vector: Vector
  destination: Point
  currentPosition: Point
  onUpdate: ((currentPosition: Point) => unknown) | undefined

  constructor(start: Point, end: Point, speed: number) {
    this.vector = new Vector(start, end)
    this.timer = new Timer((this.vector.length * 10000) / (speed * config.speedMultiplier))
    this.currentPosition = start
    this.destination = end
    this.timer.onUpdate = () => {
      const length = this.vector.length * this.timer.passedTimeRatio
      this.currentPosition = Vector.from(this.vector, length).b
      this.onUpdate?.(this.currentPosition)
    }
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
    this.destination = this.currentPosition
    this.timer.stop()
    this.onUpdate = undefined
  }

}