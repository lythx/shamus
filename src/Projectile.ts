import { Enemy } from "./Enemy.js";
import { roomManager } from "./room/RoomManager.js";
import { Unit } from "./Unit.js";
import { Circle, math, Point } from "./utils/Geometry.js";
const infinty = 10000000

interface ProjectileOptions {
  pos: Point
  angle: number
  speed: number
  size: number
  image: HTMLImageElement
  side: 'player' | 'enemy'
  explosionRadius: number
}

export class Projectile extends Unit {

  static playerProjectiles: Projectile[] = []
  static enemyProjectiles: Projectile[] = []
  private readonly image: HTMLImageElement
  private readonly shooter: Unit
  private readonly explosionRadius: number

  constructor(options: ProjectileOptions, shooter: Unit) {
    super(options)
    this.move(options.angle, infinty)
    this.side === 'player' ? Projectile.playerProjectiles.push(this)
      : Projectile.enemyProjectiles.push(this)
    this.image = options.image
    this.shooter = shooter
    this.explosionRadius = options.explosionRadius
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
      if (Enemy.enemies[i] === this.shooter) { continue }
      if (Enemy.enemies[i].hitbox.circleCollision(this.hitbox)) {
        this.explode()
      }
    }
    if (roomManager.circleCollision(this.hitbox)) {
      this.explode()
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(math.degToRad(this.angle))
    ctx.drawImage(this.image, -this.size * 3, -this.size * 0.75, this.size * 6, this.size * 1.5) // TODO maybe config?
    ctx.restore()
  }

  explode() {
    const impact = new Circle(this.pos, this.explosionRadius)
    this.registerDebug(impact)
    for (let i = 0; i < Enemy.enemies.length; i++) {
      if (Enemy.enemies[i] === this.shooter) { continue }
      if (Enemy.enemies[i].hitbox.circleCollision(impact)) {
        Enemy.enemies[i].destroy()
      }
    }
    this.destroy()
  }

  /**
   * Stops listeners and unloads object from memory
   */
  destroy(): void {
    this.tween?.stop()
    if (this.side === 'enemy') {
      const index = Projectile.enemyProjectiles.indexOf(this)
      if (index === -1) { return }
      Projectile.enemyProjectiles.splice(index, 1)
    } else {
      const index = Projectile.playerProjectiles.indexOf(this)
      if (index === -1) { return }
      Projectile.playerProjectiles.splice(index, 1)
    }
  }

}