import { AudioPlayer } from '../AudioPlayer.js'
import { config } from '../config.js'
import { Enemy } from '../Enemy.js'
import { models } from '../models.js'
import { roomManager } from '../room/RoomManager.js'
import { Point, Rectangle, Vector } from '../utils/Geometry.js'
import { Rays } from '../utils/Rays.js'
// TODO PURPLE PROJECTILE
export class Drone extends Enemy {

  private nextAiUpdate = 0
  private nextShot = Date.now() + config.shotTimeoutOnRoomLoad
  private nextCollisionCheck = 0
  private readonly models: HTMLImageElement[]
  private modelChange = 0
  private modelIndex = 0
  private static audioPlayer = new AudioPlayer('drone')
  private readonly modelChangeInterval = config.drone.modelUpdateInterval
  private readonly aiRange = config.drone.ai.range
  private readonly aiUpdateInterval = config.drone.ai.updateInterval
  private readonly aiUpdateOffset = config.drone.ai.updateIntervalOffset
  private readonly shotInterval = config.drone.ai.shotInterval
  private readonly shotIntervalOffset = config.drone.ai.shotIntervalOffset
  private readonly friendDetectionWidth = config.aiShotFriendDetectionWidth
  private readonly movementOffset = config.drone.movementOffset
  private readonly angles = [0, 90, 180, 270] as const

  constructor(pos: Point, colour: 'blue' | 'purple') {
    super({
      ...config.drone,
      pos
    })
    this.models = models.drone[colour].map(a => {
      const img = new Image()
      img.src = `./assets/drone/${a}.png`
      return img
    })
  }

  update(playerPos: Point): void {
    this.collisionAi()
    this.updateModel()
    if (Date.now() < this.nextAiUpdate) { return }
    this.shotAi(playerPos)
    this.movementAi(playerPos)
    const randOffset = Math.random() * this.aiUpdateOffset
    this.nextAiUpdate = Date.now() +
      this.aiUpdateInterval + randOffset - (this.aiUpdateOffset / 2)
  }

  collisionAi() {
    if (Date.now() < this.nextCollisionCheck) { return }
    this.nextCollisionCheck = Date.now() + config.aiCollisionCheckInterval
    this.target.pos = this.pos
    const rays = this.target.get()
    for (let i = 0; i < rays.length; i++) {
      if ((roomManager.vectorCollision(rays[i])?.calculateDistance(this.pos) ?? Infinity) < this.size * 2) {
        this.stop()
      }
    }
  }

  private movementAi(playerPos: Point) {
    if (playerPos.calculateDistance(this.pos) > this.aiRange) {
      this.untargetedMove()
    } else {
      this.targetedMove(playerPos)
    }
  }

  private untargetedMove() {
    const maxTries = 10
    let cDistance: number | undefined
    let tries = 0
    let v: Vector
    do {
      const rand = this.randomizeTarget(this.pos)
      v = Vector.from(new Vector(this.pos, rand), config.aiNoTargetMoveLength)
      cDistance = this.checkCollision(v)
      tries++
    } while ((cDistance ?? Infinity) < this.size * 4 && tries < maxTries)
    const length = Math.min(v.length, (cDistance ?? Infinity)) - this.size
    if (tries === maxTries) { this.stop() }
    else {
      this.target.setTarget(new Vector(this.pos, v.angle, v.length).b, v.length)
      this.move(v.angle, length)
    }
  }

  private targetedMove(p: Point) {
    const maxTries = 10
    let cDistance: number | undefined
    let tries = 0
    let v: Vector
    do {
      const rand = this.randomizeTarget(p)
      v = Vector.from(new Vector(this.pos, rand), config.aiTargetMoveLength)
      cDistance = this.checkCollision(v)
      if (cDistance === 0) {
        this.untargetedMove()
        return
      }
      tries++
    } while ((cDistance ?? Infinity) < this.size * 4 && tries < maxTries)
    const length = Math.min(v.length, (cDistance ?? Infinity)) - this.size
    if (tries === maxTries) { this.stop() }
    else {
      this.target.setTarget(new Vector(this.pos, v.angle, v.length).b, v.length)
      this.move(v.angle, length)
    }
  }

  private randomizeTarget(target: Point): Point {
    const randX = Math.random() * this.movementOffset
    const randY = Math.random() * this.movementOffset
    return new Point(
      target.x + randX - (this.movementOffset / 2),
      target.y + randY - (this.movementOffset / 2)
    )
  }

  checkCollision(v: Vector): number | undefined {
    const r = new Rays(this.pos, this.size)
    r.setTarget(v.b, v.length)
    const rays = r.get()
    let minCollision: number | undefined
    for (let i = 0; i < rays.length; i++) {
      const p = roomManager.vectorCollision(rays[i])
      if (p !== undefined) {
        const dist = p.calculateDistance(v.a)
        if ((minCollision ?? -1) < dist) {
          minCollision = dist
        }
      }
    }
    // for (let i = 0; i < Enemy.enemies.length; i++) {
    //   if (Enemy.enemies[i] === this) { continue }
    //   if (Enemy.enemies[i].hitbox.circleCollision(this.hitbox)) { return 0 }
    //   const dist = this.rayCollision(Enemy.enemies[i])
    //   if (dist !== undefined && (minCollision ?? -1) < dist) {
    //     minCollision = dist
    //   }
    // }
    return minCollision
  }

  private rayCollision(unit: Enemy): number | undefined {
    if (unit === this) { return }
    let minCollision: number | undefined
    const rays = this.target.get()
    const uRays = unit.target.get()
    for (let i = 0; i < uRays.length; i++) {
      this.registerDebug(uRays[i])
    }
    for (let i = 0; i < rays.length; i++) {
      this.registerDebug(rays[i])
      if (unit.hitbox.vectorCollision(rays[i])) {
        let dist = unit.pos.calculateDistance(this.pos)
        minCollision = dist
      }
      for (let j = 0; j < uRays.length; j++) {
        const p = rays[i].intersection(uRays[j])
        if (p !== undefined) {
          this.registerDebug(p)
          const dist = p.calculateDistance(this.pos)
          if ((minCollision ?? -1) < dist) {
            minCollision = dist
          }
        }
      }
    }
    return minCollision
  }

  private updateModel() {
    if (this.modelChange > Date.now()) { return }
    this.modelChange = Date.now() + this.modelChangeInterval
    this.modelIndex++
    this.modelIndex %= this.models.length
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.models[this.modelIndex], this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
  }

  private shotAi(playerPos: Point) {
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
    if (minDiff > config.drone.maxShotAngleOffset) { return }
    const v = new Vector(this.pos, direction, playerPos.calculateDistance(this.pos))
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
    for (let i = 0; i < Drone.enemies.length; i++) {
      if (Drone.enemies[i] !== this) {
        if (r.circleCollision(Drone.enemies[i].hitbox)) { return }
      }
    }
    const randOffset = Math.random() * this.shotIntervalOffset
    this.nextShot = Date.now() +
      this.shotInterval + randOffset - (this.shotIntervalOffset / 2)
    console.log('PENISER XD')
    const audioId = Drone.audioPlayer.play('shot')
    this._shoot(direction, { player: Drone.audioPlayer, id: audioId })
  }

}
