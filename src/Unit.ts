import { Player } from "./Player.js";
import { LinearTween } from "./Tweens.js";
import { Point, Vector } from "./Utils.js";

export class Unit {

  static enemies: Unit[] = []
  static player: Player
  protected pos: Point
  readonly size: number
  protected readonly speed: number
  protected tween: LinearTween | undefined
  readonly side: 'player' | 'enemy'
  angle: number
  /** TODO */
  protected readonly images: HTMLImageElement[] = []

  constructor(posX: number, posY: number, size: number, speed: number, angle: number,
    side: 'player' | 'enemy', svgs: string[]) {
    this.pos = { x: posX, y: posY }
    this.size = size
    this.speed = speed
    this.angle = angle
    this.side = side
    if (side === 'enemy') {
      Unit.enemies.push(this)
    }
  }

  move(angle: number, length: number) {
    this.angle = angle
    const destination = new Vector({ x: this.x, y: this.y }, angle, length).b
    if (this.tween !== undefined) {
      this.tween.stop()
    }
    this.tween = new LinearTween(this.pos, destination, this.speed)
    this.tween.onUpdate = (pos) => {
      this.pos = pos
    }
  }

  destroy() {
    this.tween?.stop()
    if (this.side === 'enemy') {
      const index = Unit.enemies.indexOf(this)
      if (index === -1) { throw new Error(`Unit ${this.constructor.name} not in enemy list on delete`) }
      Unit.enemies.splice(index, 1)
    }
  }

  stop() {
    this.tween?.stop()
  }

  get image(): HTMLImageElement {
    return this.images[0]
  }

  get x(): number {
    return this.pos.x
  }

  get y(): number {
    return this.pos.y
  }

}