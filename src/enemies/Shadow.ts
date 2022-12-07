import { AudioPlayer } from '../AudioPlayer.js'
import { config } from '../config.js'
import { Enemy } from '../Enemy.js'
import { models } from '../models.js'
import { Point, Vector } from '../utils/Geometry.js'

export class Shadow extends Enemy {

  private nextAiUpdate = 0
  private models: HTMLImageElement[]
  private readonly aliveModels: HTMLImageElement[]
  private readonly deadModels: HTMLImageElement[]
  private modelIndex: number = 0
  private static audioPlayer = new AudioPlayer('shadow')
  private modelChange = 0
  private dead = false
  private reviveTimestamp = 0
  private readonly movementOffset = config.shadow.movementOffset
  private readonly modelChangeInterval = config.shadow.modelUpdateInterval
  private readonly aiUpdateInterval = config.shadow.ai.updateInterval
  private readonly aiUpdateOffset = config.shadow.ai.updateIntervalOffset
  private stepAudioId: number

  constructor(pos: Point) {
    super({
      ...config.shadow,
      pos
    }, [0, 45, 90, 135, 180, 225, 270, 315])
    this.aliveModels = models.shadow.alive.map(a => {
      const img = new Image()
      img.src = `./assets/shadow/${a}.png`
      return img
    })
    this.models = this.aliveModels
    this.deadModels = models.shadow.dead.map(a => {
      const img = new Image()
      img.src = `./assets/shadow/${a}.png`
      return img
    })
    this.target.disable()
    Shadow.audioPlayer.play('spawn')
    this.stepAudioId = Shadow.audioPlayer.play('step', false, true, 1500)
  }

  update(playerPos: Point): void {
    if (this.dead) {
      if (this.reviveTimestamp > Date.now()) { return }
      this.dead = false
      this.stepAudioId = Shadow.audioPlayer.play('step', true)
      this.models = this.aliveModels
    }
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
    const randX = Math.random() * this.movementOffset
    const randY = Math.random() * this.movementOffset
    return new Point(
      target.x + randX - (this.movementOffset / 2),
      target.y + randY - (this.movementOffset / 2)
    )
  }

  private updateModel() {
    if (this.modelChange > Date.now()) { return }
    this.modelChange = Date.now() + this.modelChangeInterval
    this.modelIndex++
    this.modelIndex %= this.models.length
  }

  /**
   * Moves unit by a vector of given angle and length
   * @param angle Angle in degrees
   * @param length Vector length
   */
  move(angle: number, length: number) {
    if (this.dead) { return }
    const destination = new Vector(this.pos, angle, length)
    this._move(destination)
  }

  destroy(): void {
    if (this.dead) { return }
    Shadow.audioPlayer.stop(this.stepAudioId)
    this.stop()
    this.dead = true
    this.models = this.deadModels
    this.reviveTimestamp = Date.now() + config.shadow.reviveTimout
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.models[this.modelIndex], this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
  }

}
