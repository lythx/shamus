import { config } from '../config.js'
import { Enemy } from '../Enemy.js'
import { models } from '../models.js'
import { room } from '../Room.js'
import { Point, Rectangle, Vector } from '../utils/Geometry.js'
import { Rays } from '../utils/Rays.js'

type Direction = 'up' | 'down' | 'left' | 'right'

export class Droid extends Enemy {

  private nextAiUpdate = 0
  private nextShot = Date.now() + config.shotTimeoutOnRoomLoad
  private nextCollisionCheck = 0
  private readonly models: {
    up: HTMLImageElement[],
    down: HTMLImageElement[],
    right: HTMLImageElement[],
    left: HTMLImageElement[]
  } = {
      up: [],
      down: [],
      right: [],
      left: []
    }
  private modelChange = 0
  private modelIndex = 0
  private readonly modelChangeInterval = config.droid.modelUpdateInterval
  private readonly aiRange = config.droid.ai.range
  private readonly aiUpdateInterval = config.droid.ai.updateInterval
  private readonly aiUpdateOffset = config.droid.ai.updateIntervalOffset
  private readonly shotInterval = config.droid.ai.shotInterval
  private readonly shotIntervalOffset = config.droid.ai.shotIntervalOffset
  private readonly friendDetectionWidth = config.aiShotFriendDetectionWidth
  private readonly movementOffset = config.droid.movementOffset
  private readonly shotAngles = [0, 45, 90, 135, 180, 225, 270, 315] as const
  readonly directions: { [key: number]: Direction } = {
    0: 'right',
    90: 'down',
    180: 'left',
    270: 'up',
  }
  private currentDirection: Direction | undefined = 'down' // TODO

  constructor(pos: Point) {
    super({
      ...config.droid,
      pos
    })
    for (const key in this.models) {
      this.models[key as keyof typeof this.models] =
        models.droid[key as keyof typeof models.droid]
          .map(a => {
            const img = new Image()
            img.src = `./assets/droid/${a}.png`
            return img
          })
    }
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
      if ((room.vectorCollision(rays[i])?.calculateDistance(this.pos) ?? Infinity) < this.size * 2) {
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
      const p = room.vectorCollision(rays[i])
      if (p !== undefined) {
        const dist = p.calculateDistance(v.a)
        if ((minCollision ?? -1) < dist) {
          minCollision = dist
        }
      }
    }
    return minCollision
  }

  private updateModel() {
    if (Date.now() < this.modelChange) { return }
    this.modelChange = Date.now() + this
    this.modelIndex++
    this.modelIndex = this.currentDirection ?
      this.modelIndex % this.models[this.currentDirection].length : 0
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const model = this.currentDirection !== undefined ?
      this.models[this.currentDirection][this.modelIndex] : this.models.down[0]
    ctx.drawImage(model, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
  }

  private shotAi(playerPos: Point) {
    if (Date.now() < this.nextShot) { return }
    const { angle } = new Vector(this.pos, playerPos)
    let minDiff = Infinity
    let direction: typeof this.shotAngles[number] = 0
    for (const e of this.shotAngles) {
      const diff = Math.abs(angle - e)
      if (diff < minDiff) {
        minDiff = diff
        direction = e
      }
    }
    if (minDiff > config.droid.maxShotAngleOffset) { return }
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
    for (let i = 0; i < Droid.enemies.length; i++) {
      if (Droid.enemies[i] !== this) {
        if (r.circleCollision(Droid.enemies[i].hitbox)) { return }
      }
    }
    const randOffset = Math.random() * this.shotIntervalOffset
    this.nextShot = Date.now() +
      this.shotInterval + randOffset - (this.shotIntervalOffset / 2)
    this._shoot(direction)
  }

}
