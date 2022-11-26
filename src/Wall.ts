// import { config } from "./config";
// import { models } from "./models";
// import { Point, Rectangle, Drawable } from "./utils/Geometry";

// export class Wall implements Drawable {

//   readonly top: Rectangle
//   readonly left: Rectangle
//   readonly mid: Rectangle
//   readonly right: Rectangle
//   readonly bottom: Rectangle
//   readonly image: HTMLImageElement

//   constructor(pos: Point, width: number, height: number) {
//     this.top = new Rectangle(pos, width, config.wallBorderWidth)
//     this.left = new Rectangle(new Point(pos.x + this.top.height, pos.y),
//       config.wallBorderWidth, height - 2 * config.wallBorderWidth)
//     this.mid = new Rectangle(new Point(pos.x + this.top.height, pos.y + this.left.width),
//       width - 2 * config.wallBorderWidth, height - 2 * config.wallBorderWidth)
//     this.right = new Rectangle(new Point(pos.x, pos.y + this.left.width + this.mid.width),
//       config.wallBorderWidth, height - 2 * config.wallBorderWidth)
//     this.bottom = new Rectangle(new Point(pos.x + this.top.height + this.mid.height, pos.y),
//       width, config.wallBorderWidth)
//     this.image = new Image()
//     this.image.src = `./assets${models.wall.src}.png`
//   }

//   draw(ctx: CanvasRenderingContext2D): void {
//     for (const e of [this.top, this.left, this.bottom, this.right]) {
//       ctx.drawImage(this.image, e.a.x, e.a.y, e.width, e.height)
//     }
//   }

// }