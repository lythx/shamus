import { config } from "./config.js";
import { Fighter } from "./Fighter.js";
import { Point, Vector } from "./Utils.js";

interface EnemyOptions {
  pos: Point
  size: number
  speed: number
  angle: number
}

export class Enemy extends Fighter {

  protected static readonly angles: number[] = [0, 90, 180, 270]
  private nextAiUpdate = 0

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

  ai(playerPos: Point) {
    if (Date.now() < this.nextAiUpdate) { return }
    const cfg = config.ai
    const updateSeed = Math.random() * cfg.updateIntervalOffset
    this.nextAiUpdate = Date.now() +
      cfg.updateInterval + updateSeed - (cfg.updateIntervalOffset / 2)
    const xSeed = Math.random() * cfg.maxMovementOffset
    const ySeed = Math.random() * cfg.maxMovementOffset
    const destination = {
      x: playerPos.x + xSeed - (cfg.maxMovementOffset / 2),
      y: playerPos.y + ySeed - (cfg.maxMovementOffset / 2)
    }
    const vector = new Vector(this._pos, destination)
    this.move(vector.angle, vector.length)
  }

}