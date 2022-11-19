import { Enemy } from "./Enemy.js";
import { Unit } from "./Unit.js";
import { Circle, Point } from "./Utils.js";
const infinty = 10000000

interface ProjectileOptions {
  pos: Point
  angle: number
  speed: number
  size: number
  side: 'player' | 'enemy'
}

export class Projectile extends Unit {

  static playerProjectiles: Projectile[] = []
  static enemyProjectiles: Projectile[] = []

  constructor(options: ProjectileOptions) {
    super(options)
    this.move(options.angle, infinty)
    this.side === 'player' ? Projectile.playerProjectiles.push(this)
      : Projectile.enemyProjectiles.push(this)
  }

  update(): void {
    this.handleCollision()
  }

  /**
   * Hangles collision with walls and opposite fighters and projectiles
   */
  private handleCollision() {
    if (this.side === 'player') {
      for (const e of Projectile.enemyProjectiles) {

      }
      for (const e of Enemy.enemies) {
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < e.size + this.size) {
          this.destroy()
          e.destroy()
        }
      }
    }
  }

  /**
   * Stops listeners and unloads object from memory
   */
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