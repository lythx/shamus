import { LinearTween } from "./Tweens.js";
import { Point } from "./Utils.js";

export class Unit {

  static activeUnits: Unit[] = []
  private pos: Point
  readonly size: number
  private readonly speed: number
  private tween: LinearTween | undefined
  /** TODO */
  private readonly images: HTMLImageElement[] = []

  constructor(posX: number, posY: number, size: number, speed: number, svgs: string[]) {
    this.pos = { x: posX, y: posY }
    this.size = size
    this.speed = speed
    Unit.activeUnits.push(this)
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

  get image(): HTMLImageElement {
    return this.images[0]
  }

}