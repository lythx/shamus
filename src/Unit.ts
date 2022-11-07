import { LinearTween } from "./Tweens"
import { Point } from "./Utils"

class Unit {

  private pos: Point
  private readonly size: number
  private readonly speed: number
  private tween: LinearTween | undefined
  /** TODO */
  private readonly model: any

  constructor(posX: number, posY: number, size: number, speed: number, model: any /** TODO */) {
    this.pos = { x: posX, y: posY }
    this.size = size
    this.speed = speed
    this.model = model
  }

  get x(): number {
    return this.pos.x
  }

  get y(): number {
    return this.pos.y
  }

  move(destination: { x: number, y: number }) {
    if (this.tween !== undefined) {
      this.tween.stop()
    }
    this.tween = new LinearTween(this.pos, destination, this.speed)
    this.tween.onUpdate = (pos) => {
      this.pos = pos
    }
  }

}