import { LinearTween } from "./Tweens.js";
import { Circle, Point, Vector } from "./Utils.js";

export interface UnitOptions {
  pos: Point
  size: number
  speed: number
  angle: number
  side: 'player' | 'enemy'
}

export abstract class Unit {

  pos: Point
  readonly size: number
  readonly speed: number
  protected tween: LinearTween | undefined
  readonly side: 'player' | 'enemy'
  protected _angle: number
  readonly hitbox: Circle

  constructor(options: UnitOptions) {
    this.pos = options.pos
    this.size = options.size
    this.speed = options.speed
    this._angle = options.angle
    this.side = options.side
    this.hitbox = new Circle(this.pos, this.size)
  }

  /**
   * Moves unit by a vector of given angle and length
   * @param angle Angle in degrees
   * @param length Vector length
   */
  move(angle: number, length: number) {
    this._angle = angle
    const destination = new Vector(this.pos, angle, length).b
    if (this.tween !== undefined) {
      this.tween.stop()
    }
    this.tween = new LinearTween(this.pos, destination, this.speed)
    this.tween.onUpdate = (pos) => {
      this.pos = pos
      this.hitbox.center = pos
    }
  }

  abstract update(playerPos: Point): void

  /**
   * Stops listeners
   */
  abstract destroy(): void

  /**
   * Stops unit movement
   */
  stop() {
    this.tween?.stop()
  }

  /**
   * Current x axis position
   */
  get x(): number {
    return this.pos.x
  }

  /**
   * Current y axis position
   */
  get y(): number {
    return this.pos.y
  }

  /**
   * Current unit angle in degrees
   */
  get angle(): number {
    return this._angle
  }

}