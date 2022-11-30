import { Player } from "../Player.js"
import { Circle, Drawable, Point } from "../utils/Geometry.js"

export abstract class GameItem implements Drawable {

  readonly hitbox: Circle
  readonly image: HTMLImageElement
  readonly pos: Point
  readonly size: number
  protected abstract readonly _onCollect: Function
  static items: GameItem[]

  constructor(pos: Point, size: number, image: HTMLImageElement) {
    this.pos = pos
    this.hitbox = new Circle(pos, size * 2)
    this.image = image
    this.size = size
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.image, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2)
  }

  checkCollision(player: Player) {
    if (player.hitbox.circleCollision(this.hitbox)) {
      this._onCollect()
    }
  }

}