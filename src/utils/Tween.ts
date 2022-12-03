import { config } from "../config.js"
import { Timer } from "./Timer.js"
import { Point, Vector } from "./Geometry.js"

export class Tween {

  private timer: Timer
  vector: Vector
  destination: Point
  currentPosition: Point
  onUpdate: ((currentPosition: Point) => unknown) | undefined
  onEnd: (() => unknown) | undefined

  constructor(start: Point, end: Point, speed: number) {
    this.vector = new Vector(start, end)
    this.timer = new Timer().start((this.vector.length * 10000) / (speed * config.speedMultiplier))
    this.currentPosition = start
    this.destination = end
    this.timer.onUpdate = () => {
      const length = this.vector.length * this.timer.passedTimeRatio
      this.currentPosition = Vector.from(this.vector, length).b
      this.onUpdate?.(this.currentPosition)
    }
    this.timer.onEnd = () => {
      this.currentPosition = this.destination
      this.onEnd?.()
    }
  }

  reset(start: Point, end: Point, speed: number) {
    this.destination = this.currentPosition
    this.timer.stop()
    this.vector = new Vector(start, end)
    this.timer = new Timer().start((this.vector.length * 10000) / (speed * config.speedMultiplier))
    this.currentPosition = start
    this.destination = end
    this.timer.onUpdate = () => {
      const length = this.vector.length * this.timer.passedTimeRatio
      this.currentPosition = Vector.from(this.vector, length).b
      this.onUpdate?.(this.currentPosition)
    }
    this.timer.onEnd = () => {
      this.currentPosition = this.destination
      this.onEnd?.()
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