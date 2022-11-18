import { config } from "./config.js";
import { Projectile } from "./Projectile.js";
import { Unit } from "./Unit.js";
import { Point } from "./Utils.js";

export class Player extends Unit {

  projectileSpeed: number
  projectileSize: number

  constructor(pos: Point, angle: number) {
    super({
      ...config.player,
      pos,
      angle,
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
    new Projectile({
      pos: this.pos,
      angle: this.angle,
      speed: this.projectileSpeed,
      size: this.projectileSize,
      side: this.side
    })
  }

}