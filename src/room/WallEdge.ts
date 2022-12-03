import { config } from "../config.js";
import { models } from "../models.js";
import { Drawable, Point, Rectangle } from "../utils/Geometry.js";

export class WallEdge extends Rectangle implements Drawable {

  readonly orientation: 'vertical' | 'horizontal'
  readonly images: HTMLImageElement[]
  imageIndex: number = 0
  nextImageUpdate: number = 0

  constructor(a: Point, c: Point) {
    super(a, c)
    this.orientation = this.width < this.height ? 'vertical' : 'horizontal'
    this.images = models.wall[this.orientation].map(a => {
      const img = new Image()
      img.src = `./assets/wall/${a}.png`
      return img
    })
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const pattern = ctx.createPattern(this.images[this.imageIndex], "repeat") as CanvasPattern
    ctx.fillStyle = pattern
    ctx.fillRect(this.a.x, this.a.y, this.width, this.height)
    if (this.nextImageUpdate > Date.now()) { return }
    this.nextImageUpdate = Date.now() + config.wallUpdateInterval
    this.imageIndex++
    this.imageIndex = this.imageIndex % this.images.length
  }

}