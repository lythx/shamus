import { Player } from "./Player.js";
import { LinearTween } from "./Tweens.js";
import { Point, Vector } from "./Utils.js";

export class Unit {

  static enemies: Unit[] = []
  static player: Player
  private pos: Point
  readonly size: number
  private readonly speed: number
  private tween: LinearTween | undefined
  readonly side: 'player' | 'enemy'
  angle: number
  /** TODO */
  private readonly images: HTMLImageElement[] = []

  constructor(posX: number, posY: number, size: number, speed: number, angle: number,
    side: 'player' | 'enemy', svgs: string[]) {
    this.pos = { x: posX, y: posY }
    this.size = size
    this.speed = speed
    this.angle = angle
    this.side = side
    side === 'player' ? Unit.player = this : Unit.enemies.push(this)
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