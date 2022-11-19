import { config } from '../config.js'
import { Enemy } from '../Enemy.js'
import { Point, Vector } from '../Utils.js'

export class Drone extends Enemy {

  private nextAiUpdate = 0
  private aiRange = config.drone.ai.range

  constructor(pos: Point, colour: 'blue' | 'purple') {
    super({
      ...config.drone,
      pos
    })
  }

  update(playerPos: Point): void {
    this.movementAi(playerPos)
  }

  private shotAi(playerPos: Point) {
    const v = new Vector(this.pos, playerPos)
    let minDiff = Infinity
    let direction = 0
    for (const e of this.angles) {
      const diff = Math.abs(v.angle - e)
      if (diff < minDiff) {
        minDiff = diff
        direction = e
      }
    }
    console.log(direction)
    this._shoot(direction)
  }

  private movementAi(playerPos: Point) {
    if (Date.now() < this.nextAiUpdate) { return }
    this.shotAi(playerPos)
    const cfg = config.drone.ai
    const updateSeed = Math.random() * cfg.updateIntervalOffset
    this.nextAiUpdate = Date.now() +
      cfg.updateInterval + updateSeed - (cfg.updateIntervalOffset / 2)
    const xSeed = Math.random() * cfg.maxMovementOffset
    const ySeed = Math.random() * cfg.maxMovementOffset
    let destination: Point
    if (playerPos.calculateDistance(this.pos) > cfg.range) {
      destination = new Point(
        this.x + xSeed - (cfg.maxMovementOffset / 2),
        this.y + ySeed - (cfg.maxMovementOffset / 2)
      )
    } else {
      destination = new Point(
        playerPos.x + xSeed - (cfg.maxMovementOffset / 2),
        playerPos.y + ySeed - (cfg.maxMovementOffset / 2)
      )
    }
    const vector = new Vector(this.pos, destination)
    this.move(vector.angle, vector.length)
  }

}