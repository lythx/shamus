import { Fighter } from "./Fighter.js";
import { Projectile } from "./Projectile.js";
import { Point } from "./Utils.js";

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

export class Shooter extends Fighter {

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
    console.log(angle)
    new Projectile({
      pos: this._pos,
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