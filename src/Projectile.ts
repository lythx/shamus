import { Enemy } from "./Enemy.js";
import { room } from "./Room.js";
import { Unit } from "./Unit.js";
import { Circle, math, Point, Vector } from "./utils/Geometry.js";
const infinty = 10000000

interface ProjectileOptions {
  pos: Point
  angle: number
  speed: number
  size: number
  image: HTMLImageElement
  side: 'player' | 'enemy'
}

export class Projectile extends Unit {

  static playerProjectiles: Projectile[] = []
  static enemyProjectiles: Projectile[] = []
  private readonly image: HTMLImageElement

  constructor(options: ProjectileOptions) {
    super(options)
    this.pos = new Vector(this.pos, this.angle, this.size * 2).b
    this.move(options.angle, infinty)
    this.side === 'player' ? Projectile.playerProjectiles.push(this)
      : Projectile.enemyProjectiles.push(this)
    this.image = options.image
  }

  update(): void {
    this.handleCollision()
  }

  /**
   * Hangles collision with walls and opposite fighters and projectiles
   */
  private handleCollision() {
    if (this.side === 'player') {
      for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
        if (Projectile.enemyProjectiles[i].hitbox.circleCollision(this.hitbox)) {
          Projectile.enemyProjectiles[i].destroy()
        }
      }
    }
    for (let i = 0; i < Enemy.enemies.length; i++) {
      if (Enemy.enemies[i].hitbox.circleCollision(this.hitbox)) {
        Enemy.enemies[i].destroy()
        this.destroy()
      }
    }
    if (room.circleCollision(this.hitbox)) {
      this.destroy()
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(math.degToRad(this.angle))
    ctx.drawImage(this.image, -this.size * 3, -this.size * 0.75, this.size * 6, this.size * 1.5)
    ctx.restore()
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