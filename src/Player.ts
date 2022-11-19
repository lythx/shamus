import { config } from "./config.js";
import { Projectile } from "./Projectile.js";
import { Fighter } from "./Fighter.js";
import { Point } from "./Utils.js";

export class Player extends Fighter {

  projectileSpeed: number
  projectileSize: number

  constructor(pos: Point) {
    super({
      ...config.player,
      pos,
      side: 'player'
    })
    this.projectileSpeed = config.player.projectile.speed
    this.projectileSize = config.player.projectile.size
  }

  update(): void { }

  destroy(): void {
    // todo
  }

  shoot(): void {
    this._shoot(this._angle)
  }

}