import { config } from '../config.js'
import { Enemy } from '../Enemy.js'
import { models } from '../models.js'
import { Point, Vector } from '../utils/Geometry.js'

export class Shadow extends Enemy {

  private nextAiUpdate = 0
  private readonly models: HTMLImageElement[]
  private modelIndex: number = 0
  private modelChange = 0
  private readonly movementOffset = config.shadow.movementOffset
  private readonly modelChangeInterval = config.shadow.modelUpdateInterval
  private readonly aiUpdateInterval = config.shadow.ai.updateInterval
  private readonly aiUpdateOffset = config.shadow.ai.updateIntervalOffset

  constructor(pos: Point) {
    super({
      ...config.shadow,
      pos
    })
    this.models = models.shadow.map(a => {
      const img = new Image()
      img.src = `./assets/shadow/${a}.png`
      return img
    })
    this.target.disable()
  }

  update(playerPos: Point): void {
    this.updateModel()
    if (Date.now() < this.nextAiUpdate) { return }
    this.targetedMove(playerPos)
    const randOffset = Math.random() * this.aiUpdateOffset
    this.nextAiUpdate = Date.now() +
      this.aiUpdateInterval + randOffset - (this.aiUpdateOffset / 2)
  }

  private targetedMove(p: Point) {
    const rand = this.randomizeTarget(p)
    const v = Vector.from(new Vector(this.pos, rand), config.aiTargetMoveLength)
    this.move(v.angle, config.aiTargetMoveLength)
  }

  private randomizeTarget(target: Point): Point {
    const randX = Math.random() *  this.movementOffset
    const randY = Math.random() * this.movementOffset
    return new Point(
      target.x + randX - ( this.movementOffset / 2),
      target.y + randY - ( this.movementOffset / 2)
    )
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

}
