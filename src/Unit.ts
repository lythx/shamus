import { config } from "./config.js";
import { Tween } from "./utils/Tween.js";
import { Circle, Drawable, Point, Vector } from "./utils/Geometry.js";

export interface UnitOptions {
  pos: Point
  size: number
  speed?: number
  side: 'player' | 'enemy'
}

export abstract class Unit implements Drawable {

  private _pos: Point
  readonly size: number
  readonly speed: number
  protected tween: Tween
  readonly side: 'player' | 'enemy'
  protected _angle: number = 0
  readonly hitbox: Circle
  _debug: Drawable[] = []

  constructor(options: UnitOptions) {
    this._pos = options.pos
    this.size = options.size
    this.speed = options.speed ?? -1
    this.side = options.side
    this.hitbox = new Circle(this._pos, this.size)
    this.tween = new Tween(this._pos, this._pos, this.speed)
  }

  protected _move(v: Vector) {
    this._angle = v.angle
    const destination = v.b
    this.tween.reset(this._pos, destination, this.speed)
    this.tween.onUpdate = (pos) => {
      this._pos = pos
      this.hitbox.center = pos
    }
  }

  get pos(): Point {
    return this._pos
  }

  set pos(pos: Point) {
    this.hitbox.center = pos
    this._pos = pos
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;

  /**
   * Moves unit by a vector of given angle and length
   * @param angle Angle in degrees
   * @param length Vector length
   */
  move(angle: number, length: number) {
    const destination = new Vector(this._pos, angle, length)
    this._move(destination)
  }

  registerDebug(debugData: Drawable, duration: number = config.debugDuration) {
    this._debug.push(debugData)
    setTimeout(() => this._debug = this._debug.filter(a => a !== debugData), duration)
  }

  get debug(): Drawable[] {
    return this._debug
  }

  abstract update(player_pos: Point): void

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
   * Current x axis _position
   */
  get x(): number {
    return this._pos.x
  }

  /**
   * Current y axis _position
   */
  get y(): number {
    return this._pos.y
  }

  /**
   * Current unit angle in degrees
   */
  get angle(): number {
    return this._angle
  }

}