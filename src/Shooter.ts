import { Projectile } from "./Projectile.js";
import { Point } from "./Utils.js";
import { Unit } from "./Unit.js"

interface ShooterOptions {
  pos: Point
  size: number
  speed: number
  projectile: {
    speed: number
    size: number
  }
  angle: number
  side: 'player' | 'enemy'
}

export abstract class Shooter extends Unit {

  readonly projectileSpeed: number
  readonly projectileSize: number

  constructor(options: ShooterOptions) {
    super(options)
    this.projectileSpeed = options.projectile.speed
    this.projectileSize = options.projectile.size
  }

  /**
   * Fires a projectile in given angle
   */
  protected _shoot(angle: number) {
    new Projectile({
      pos: this.pos,
      angle,
      speed: this.projectileSpeed,
      size: this.projectileSize,
      side: this.side
    })
  }

  shoot(angle: number) {
    this._shoot(angle)
  }

}