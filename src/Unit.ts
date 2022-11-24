import { config } from "./config.js";
import { LinearTween } from "./Tweens.js";
import { Circle, Drawable, Point, Rectangle, Vector } from "./utils/Geometry.js";

export interface UnitOptions {
  pos: Point
  size: number
  speed: number
  side: 'player' | 'enemy'
}

export abstract class Unit implements Drawable {

  pos: Point
  readonly size: number
  readonly speed: number
  protected tween: LinearTween
  readonly side: 'player' | 'enemy'
  protected _angle: number = 0
  readonly hitbox: Circle
  _debug: Drawable[] = []

  constructor(options: UnitOptions) {
    this.pos = options.pos
    this.size = options.size
    this.speed = options.speed
    this.side = options.side
    this.hitbox = new Circle(this.pos, this.size)
    this.tween = new LinearTween(this.pos, this.pos, this.speed)
  }

  protected _move(v: Vector) {
    this._angle = v.angle
    const destination = v.b
    this.tween.reset(this.pos, destination, this.speed)
    this.tween.onUpdate = (pos) => {
      this.pos = pos
      this.hitbox.center = pos
    }
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;

  /**
   * Moves unit by a vector of given angle and length
   * @param angle Angle in degrees
   * @param length Vector length
   */
  move(angle: number, length: number) {
    const destination = new Vector(this.pos, angle, length)
    this._move(destination)
  }

  registerDebug(debugData: Drawable, duration: number = config.debugDuration) {
    this._debug.push(debugData)
    setTimeout(() => this._debug = this._debug.filter(a => a !== debugData), duration)
  }

  get debug(): Drawable[] {
    return this._debug
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