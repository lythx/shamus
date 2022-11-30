import { Player } from "../Player.js"
import { Circle, Drawable, Point } from "../utils/Geometry.js"

export abstract class GameItem implements Drawable {

  readonly hitbox: Circle
  readonly image: HTMLImageElement
  readonly pos: Point
  protected abstract readonly _onCollect: Function
  static items: GameItem[]

  constructor(pos: Point, size: number, image: HTMLImageElement) {
    this.pos = pos
    this.hitbox = new Circle(pos, size * 2)
    this.image = image
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.image, this.pos.x, this.pos.y)
  }

  checkCollision(player: Player) {
    if (player.hitbox.circleCollision(this.hitbox)) {
      this._onCollect()
    }
  }

}