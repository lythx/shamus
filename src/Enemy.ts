import { config } from "./config.js";
import { Fighter } from "./Fighter.js";
import { Point, Vector } from "./utils/Geometry.js";
import { Rays } from "./utils/Rays.js";

interface EnemyOptions {
  pos: Point
  size: number
  speed: number
  projectile: {
    speed: number
    size: number
  }
  models: {
    dir: string
    back: string[]
  }
}

export abstract class Enemy extends Fighter {

  protected readonly angles = [0, 90, 180, 270] as const
  static enemies: Enemy[] = []
  target: Rays
  static groups: Enemy[][] = []

  constructor(options: EnemyOptions) {
    super({ ...options, side: 'enemy' })
    Enemy.enemies.push(this)
    this.target = new Rays(options.pos, options.size)
  }

  /**
   * Stops listeners and unloads object from memory
   */
  destroy(): void {
    this.tween?.stop()
    if (this.side === 'enemy') {
      const index = Enemy.enemies.indexOf(this)
      if (index === -1) { throw new Error(`Enemy ${this.constructor.name} not in enemy list on delete`) }
      Enemy.enemies.splice(index, 1)
    }
  }

  move(angle: number, length: number): void {
    const v = new Vector(this.pos, angle, length)
    this.target.setTarget(v.b, v.length + this.size)
    this._move(v)
  }

  abstract update(playerPos: Point): void

}