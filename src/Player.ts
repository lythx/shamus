import { config } from "./config.js";
import { Projectile } from "./Projectile.js";
import { Fighter } from "./Fighter.js";
import { models } from "./models.js";
import { Point } from "./utils/Geometry.js";

export class Player extends Fighter {

  projectileSpeed: number
  projectileSize: number
  readonly dir = models.player.dir
  nextModelUpdate: number = 0
  readonly models: {
    up: HTMLImageElement[]
  } = {
      up: []
    }
  readonly directions = ['down']
  modelIndex = 0

  constructor(pos: Point) {
    super({
      ...config.player,
      pos,
      side: 'player'
    })
    this.projectileSpeed = config.player.projectile.speed
    this.projectileSize = config.player.projectile.size
    this.models.up = models.player.up.map(a => {
      const img = new Image()
      img.src = `./assets/${models.player.dir}/${a}.png`
      return img
    })
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const model = this.models.up[this.modelIndex]
    ctx.drawImage(model, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
    if (Date.now() < this.nextModelUpdate) { return }
    this.nextModelUpdate = Date.now() + config.player.modelUpdateInterval
    this.modelIndex++
    this.modelIndex = this.modelIndex % this.models.up.length
  }

  update(): void { }

  destroy(): void {
    // todo
  }

  shoot(): void {
    this._shoot(this._angle)
  }

}