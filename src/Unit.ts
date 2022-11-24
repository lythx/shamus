import { config } from "./config.js";
import { LinearTween } from "./Tweens.js";
import { Circle, Drawable, Point, Rectangle, Vector } from "./utils/Geometry.js";

export interface UnitOptions {
  pos: Point
  size: number
  speed: number
  side: 'player' | 'enemy'
}

export abstract class Unit {

  pos: Point
  readonly size: number
  readonly speed: number
  protected tween: LinearTween
  readonly side: 'player' | 'enemy'
  protected _angle: number = 0
  readonly hitbox: Circle
  _debug: Drawable[] = []
  debugKeys: { [key: string]: Drawable | undefined } = {}

  constructor(options: UnitOptions) {
    this.pos = options.pos
    this.size = options.size
    this.speed = options.speed
    this.side = options.side
    this.hitbox = new Circle(this.pos, this.size)
    this.tween = new LinearTween(this.pos, this.pos, this.speed)
  }

  /**
   * Moves unit by a vector of given angle and length
   * @param angle Angle in degrees
   * @param length Vector length
   */
  move(angle: number, length: number) {
    this._angle = angle
    const destination = new Vector(this.pos, angle, length).b
    this.tween.reset(this.pos, destination, this.speed)
    this.tween.onUpdate = (pos) => {
      this.pos = pos
      this.hitbox.center = pos
    }
  }

  registerDebugKey(key: string, data: Drawable | undefined) {
    this.debugKeys[key] = data
  }

  registerDebug(debugData: Drawable, duration: number = config.debugDuration) {
    this._debug.push(debugData)
    setTimeout(() => this._debug = this._debug.filter(a => a !== debugData), duration)
  }

  get debug(): Drawable[] {
    const arr = this._debug
    const keyData = Object.values(this.debugKeys)
    for (let i = 0; i < keyData.length; i++) {
      if (keyData[i] !== undefined) { arr.push(keyData[i] as Drawable) }
    }
    return arr
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