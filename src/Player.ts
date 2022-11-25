import { config } from "./config.js";
import { Fighter } from "./Fighter.js";
import { models } from "./models.js";
import { Point, Vector } from "./utils/Geometry.js";

type Direction = 'right' | 'downright' | 'down' | 'downleft' | 'left' | 'upleft' | 'up' | 'upright'
const infinity = 1000000

export class Player extends Fighter {

  projectileSpeed: number
  projectileSize: number
  readonly dir = models.player.dir
  nextModelUpdate: number = 0
  readonly directions: { [key: number]: Direction } = {
    0: 'right',
    45: 'downright',
    90: 'down',
    135: 'downleft',
    180: 'left',
    225: 'upleft',
    270: 'up',
    315: 'upright'
  }
  readonly models: { [direction in Direction]: HTMLImageElement[] } = {
    right: [],
    downright: [],
    down: [],
    downleft: [],
    left: [],
    upleft: [],
    up: [],
    upright: []
  }
  currentDirection: typeof this.directions[keyof typeof this.directions] | undefined
  modelIndex = 0

  constructor(pos: Point) {
    super({
      ...config.player,
      pos,
      side: 'player'
    })
    this.projectileSpeed = config.player.projectile.speed
    this.projectileSize = config.player.projectile.size
    for (const key in this.models) {
      this.models[key as keyof typeof this.models] =
        (models.player[key as keyof typeof models.player] as string[])
          .map(a => {
            const img = new Image()
            img.src = `./assets/${models.player.dir}/${a}.png`
            return img
          })
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const model = this.currentDirection !== undefined ?
      this.models[this.currentDirection][this.modelIndex] : this.models.up[0]
    console.log(model, this.modelIndex)
    ctx.drawImage(model, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
  }

  update(): void {
    if (Date.now() < this.nextModelUpdate) { return }
    this.nextModelUpdate = Date.now() + config.player.modelUpdateInterval
    this.modelIndex++
    this.modelIndex = this.currentDirection ?
      this.modelIndex % this.models[this.currentDirection].length : 0
  }

  destroy(): void {
    // todo
  }

  move(angle: number, length: number): void {
    this.currentDirection = this.directions[angle]
    this.modelIndex = 0
    this._move(new Vector(this.pos, angle, infinity))
  }

  shoot(): void {
    this._shoot(this._angle)
  }

}