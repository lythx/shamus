import { Player } from "../Player.js"
import { Circle, Drawable, Point } from "../utils/Geometry.js"

export abstract class GameItem implements Drawable {

  hitbox: Circle
  readonly image: HTMLImageElement
  _pos: Point
  readonly size: number
  protected abstract readonly _onCollect: Function
  static items: GameItem[]

  constructor(size: number, image: HTMLImageElement) {
    this._pos = new Point(-1, -1)
    this.hitbox = new Circle(this._pos, size * 2)
    this.image = image
    this.size = size
  }

  set pos(pos: Point) {
    this._pos = pos
    this.hitbox = new Circle(this._pos, this.size * 2)
  }

  get pos() {
    return this.pos
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.image, this._pos.x - this.size, this._pos.y - this.size, this.size * 2, this.size * 2)
  }

  checkCollision(player: Player) {
    if (player.hitbox.circleCollision(this.hitbox)) {
      this._onCollect()
    }
  }

}