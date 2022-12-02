import { Explosion } from "./Explosion.js";
import { Fighter } from "./Fighter.js";
import { Point, Vector } from "./utils/Geometry.js";
import { Rays } from "./utils/Rays.js";

interface EnemyOptions {
  pos: Point
  size: number
  speed: number
  projectile?: {
    speed: number
    size: number
    modelPath: string
    explosionRadius: number
  }
}

export abstract class Enemy extends Fighter {

  static onKill: (wasLastEnemy: boolean) => void = () => undefined
  static enemies: Enemy[] = []
  target: Rays
  protected readonly moveAngles: number[] = [0, 90, 180, 270]
  protected readonly maxAngleOffset: number

  constructor(options: EnemyOptions, moveAngles?: number[]) {
    if (options.projectile !== undefined) {
      const projectileImg = new Image()
      projectileImg.src = `./assets/${options.projectile.modelPath}.png`
      super({ ...options, side: 'enemy', projectile: { ...options.projectile, image: projectileImg } })
    } else {
      super({ pos: options.pos, size: options.size, speed: options.speed, side: 'enemy' })
    }
    Enemy.enemies.push(this)
    if (moveAngles !== undefined) {
      this.moveAngles = moveAngles
    }
    this.maxAngleOffset = Math.abs(this.moveAngles[1] - this.moveAngles[0]) / 2
    this.target = new Rays(options.pos, options.size)
  }

  /**
   * Stops listeners and unloads object from memory
   */
  destroy(): void {
    this.tween?.stop()
    if (this.side === 'enemy') {
      const index = Enemy.enemies.indexOf(this)
      if (index === -1) { return }
      Enemy.enemies.splice(index, 1)
      Enemy.onKill(Enemy.enemies.length === 0)
      new Explosion(this.pos)
    }
  }

  move(angle: number, length: number): void {
    let trimmedAngle = 0
    for (let i = 0; i < this.moveAngles.length; i++) {
      if (Math.abs(this.moveAngles[i] - angle) <= this.maxAngleOffset) {
        trimmedAngle = this.moveAngles[i]
        break
      }
    }
    const v = new Vector(this.pos, trimmedAngle, length)
    this.target.setTarget(v.b, v.length + this.size)
    this._move(v)
  }

  abstract update(playerPos: Point): void

}