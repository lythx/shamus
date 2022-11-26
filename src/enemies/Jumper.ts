import { config } from '../config.js'
import { Enemy } from '../Enemy.js'
import { models } from '../models.js'
import { room } from '../Room.js'
import { Circle, Point, Vector } from '../utils/Geometry.js'

export class Jumper extends Enemy {

  private nextAiUpdate = 0
  private readonly model: HTMLImageElement
  private readonly jumpModel: HTMLImageElement
  private currentModel: HTMLImageElement
  private readonly aiRange = config.jumper.ai.range
  private readonly aiUpdateInterval = config.jumper.ai.updateInterval
  private readonly aiUpdateOffset = config.jumper.ai.updateIntervalOffset

  constructor(pos: Point) {
    super({
      ...config.jumper,
      pos
    })
    this.model = new Image()
    this.model.src = `./assets/jumper/${models.jumper.normal}.png`
    this.jumpModel = new Image()
    this.jumpModel.src = `./assets/jumper/${models.jumper.jump}.png`
    this.currentModel = this.model
  }

  update(playerPos: Point): void {
    if (Date.now() < this.nextAiUpdate) { return }
    this.movementAi(playerPos)
    const randOffset = Math.random() * this.aiUpdateOffset
    this.nextAiUpdate = Date.now() +
      this.aiUpdateInterval + randOffset - (this.aiUpdateOffset / 2)
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
    let tries = 0
    let p: Point
    do {
      const rand = this.randomizeTarget(this.pos)
      p = Vector.from(new Vector(this.pos, rand), config.aiNoTargetMoveLength).b
      this.isColliding(p)
      tries++
    } while (this.isColliding(p) && tries < maxTries)
    if (tries !== maxTries) { this.pos = p }
  }

  private targetedMove(target: Point) {
    const maxTries = 10
    let tries = 0
    let p: Point
    do {
      const rand = this.randomizeTarget(target)
      p = Vector.from(new Vector(this.pos, rand), config.aiNoTargetMoveLength).b
      if (this.isBehindWall(p)) {
        this.untargetedMove()
        return
      }
      tries++
    } while (this.isColliding(p) && tries < maxTries)
    if (tries !== maxTries) { this.pos = p }
  }

  private randomizeTarget(target: Point): Point {
    const randX = Math.random() * config.aiMovementOffset
    const randY = Math.random() * config.aiMovementOffset
    return new Point(
      target.x + randX - (config.aiMovementOffset / 2),
      target.y + randY - (config.aiMovementOffset / 2)
    )
  }

  isBehindWall(p: Point): boolean {
    const v = new Vector(this.pos, p)
    return room.vectorCollision(v) !== undefined
  }

  isColliding(p: Point): boolean {
    const c = new Circle(p, this.size)
    if (this.isBehindWall(p)) { return true }
    if (room.circleCollision(c)) { return true }
    for (let i = 0; i < Enemy.enemies.length; i++) {
      if (Enemy.enemies[i] === this) { continue }
      if (Enemy.enemies[i].hitbox.circleCollision(c)) { return true }
    }
    return false
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.model, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
  }

}
