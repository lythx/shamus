import { AudioPlayer } from "./AudioPlayer.js";
import { config } from "./config.js";
import { models } from "./models.js";
import { Circle, Point } from "./utils/Geometry.js";

export class Explosion extends Circle {

  static explosions: Explosion[] = []
  static models = models.explosion.map(a => {
    const img = new Image()
    img.src = `./assets/explosion/${a}.png`
    return img
  })
  static audioPlayer = new AudioPlayer('other')
  private currentModel: number = 0
  private nextModelChange: number
  private readonly modelChangeInterval = config.explosionModelChange

  constructor(pos: Point) {
    super(pos, config.explosionRadius)
    Explosion.explosions.push(this)
    this.nextModelChange = Date.now() + this.modelChangeInterval
    Explosion.audioPlayer.play('explosion')
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(Explosion.models[this.currentModel], this.center.x - this.radius,
      this.center.y - this.radius, this.radius * 2, this.radius * 2)
    if (this.nextModelChange < Date.now()) {
      this.nextModelChange = Date.now() + this.modelChangeInterval
      this.currentModel++
      if (this.currentModel >= Explosion.models.length) {
        const index = Explosion.explosions.indexOf(this)
        if (index === -1) { return }
        Explosion.explosions.splice(index, 1)
      }
    }
  }

}