import { Fighter } from "./Fighter.js";
import { Point } from "./Utils.js";

interface EnemyOptions {
  pos: Point
  size: number
  speed: number
  angle: number
}

export class Enemy extends Fighter {

  static enemies: Enemy[] = []

  constructor(options: EnemyOptions) {
    super({ ...options, side: 'enemy' })
    Enemy.enemies.push(this)
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

}