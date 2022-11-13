import { Unit } from "./Unit.js";
import { config } from './config.js'
import { Point, Vector } from "./Utils.js";
const size = 1
const infinty = 10000000

export class Projectile extends Unit {

  readonly damage: number

  constructor(startingPoint: Point, angle: number, speed: number, damage: number, side: 'player' | 'enemy') {
    super(startingPoint.x, startingPoint.y, size, speed, angle, side, [])
    this.damage = damage
    this.move(angle, infinty)
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

}