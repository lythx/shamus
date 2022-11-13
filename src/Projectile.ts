import { Unit } from "./Unit.js";
import { config } from './config.js'
import { Point, Vector } from "./Utils.js";
const size = 3
const infinty = 10000000

export class Projectile extends Unit {

  static playerProjectiles: Projectile[] = []
  static enemyProjectiles: Projectile[] = []
  readonly damage: number

  constructor(startingPoint: Point, angle: number, speed: number, damage: number, side: 'player' | 'enemy') {
    super(startingPoint.x, startingPoint.y, size, speed, angle, side, [])
    this.damage = damage
    this.move(angle, infinty)
    side === 'player' ? Projectile.playerProjectiles.push(this) : Projectile.enemyProjectiles.push(this)
  }

  checkCollision() {
    if (this.side === 'player') {
      for (const e of Unit.enemies) {
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < e.size + this.size) {
          // handle collision
        }
      }
    }
  }

  destroy(): void {
    this.tween?.stop()
    if (this.side === 'enemy') {
      const index = Projectile.enemyProjectiles.indexOf(this)
      if (index === -1) { throw new Error(`Enemy projectile ${this.constructor.name} not in list on delete`) }
      Projectile.enemyProjectiles.splice(index, 1)
    } else {
      const index = Projectile.playerProjectiles.indexOf(this)
      if (index === -1) { throw new Error(`Player projectile ${this.constructor.name} not in list on delete`) }
      Projectile.playerProjectiles.splice(index, 1)
    }
  }

}