import { config } from '../config.js'
import { Enemy } from '../Enemy.js'
import { Point, Rectangle, Vector } from '../Utils.js'

export class Drone extends Enemy {

  private nextAiUpdate = 0
  private nextShot = 0
  private readonly aiRange = config.drone.ai.range
  private readonly aiUpdateInterval = config.drone.ai.updateInterval
  private readonly aiUpdateOffset = config.drone.ai.updateIntervalOffset
  private readonly shotInterval = config.drone.ai.shotInterval
  private readonly shotIntervalOffset = config.drone.ai.shotIntervalOffset
  private readonly friendDetectionWidth = config.aiShotFriendDetectionWidth

  constructor(pos: Point, colour: 'blue' | 'purple') {
    super({
      ...config.drone,
      pos
    })
  }

  update(playerPos: Point): void {
    this.shotAi(playerPos)
    this.movementAi(playerPos)
  }

  private shotAi(playerPos: Point) {
    if (Date.now() < this.nextAiUpdate) { return }
    if (Date.now() < this.nextShot) { return }
    const { angle } = new Vector(this.pos, playerPos)
    let minDiff = Infinity
    let direction: typeof this.angles[number] = 0
    for (const e of this.angles) {
      const diff = Math.abs(angle - e)
      if (diff < minDiff) {
        minDiff = diff
        direction = e
      }
    }
    if (minDiff > config.aiMaxShotAngleOffset) { return }
    const v = new Vector(this.pos, direction, playerPos.calculateDistance(this.pos))
    this.registerDebugData(v, 1000)
    let a: Point
    let width: number
    let height: number
    if (direction === 180 || direction === 0) {
      a = new Point(Math.min(v.a.x, v.b.x), v.a.y - this.friendDetectionWidth / 2)
      width = v.length
      height = this.friendDetectionWidth
    } else {
      a = new Point(v.a.x - this.friendDetectionWidth / 2, Math.min(v.a.y, v.b.y))
      width = this.friendDetectionWidth
      height = v.length
    }
    const r = new Rectangle(a, width, height)
    this.registerDebugData(r, 500)
    for (let i = 0; i < Drone.enemies.length; i++) {
      if (Drone.enemies[i] !== this) {
        if (r.circleCollision(Drone.enemies[i].hitbox)) { return }
      }
    }
    const randOffset = Math.random() * this.shotIntervalOffset
    this.nextShot = Date.now() +
      this.shotInterval + randOffset - (this.shotIntervalOffset / 2)
    this._shoot(direction)
  }

  private movementAi(playerPos: Point) {
    if (Date.now() < this.nextAiUpdate) { return }
    const randOffset = Math.random() * this.aiUpdateOffset
    this.nextAiUpdate = Date.now() +
      this.aiUpdateInterval + randOffset - (this.aiUpdateOffset / 2)
    const randX = Math.random() * config.aiMovementOffset
    const randY = Math.random() * config.aiMovementOffset
    let destination: Point
    if (playerPos.calculateDistance(this.pos) > this.aiRange) {
      destination = new Point(
        this.x + randX - (config.aiMovementOffset / 2),
        this.y + randY - (config.aiMovementOffset / 2)
      )
    } else {
      destination = new Point(
        playerPos.x + randX - (config.aiMovementOffset / 2),
        playerPos.y + randY - (config.aiMovementOffset / 2)
      )
    }
    const vector = new Vector(this.pos, destination)
    this.move(vector.angle, vector.length)
  }

}