import { models } from "../models.js";
import { Drawable, Point, Rectangle } from "../utils/Geometry.js";

export class WallInside extends Rectangle implements Drawable {

  readonly image: HTMLImageElement

  constructor(a: Point, c: Point, style: string) {
    super(a, c)
    this.image = new Image()
    this.image.src = `./assets/wall/${models.wall.inside[style as keyof typeof models.wall.inside]}.png`
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const pattern = ctx.createPattern(this.image, "repeat") as CanvasPattern
    ctx.fillStyle = pattern
    ctx.fillRect(this.a.x, this.a.y, this.width, this.height)
  }

}