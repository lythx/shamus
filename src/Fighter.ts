import { Projectile } from "./Projectile.js";
import { Point } from "./utils/Geometry.js";
import { Unit } from "./Unit.js"
import { AudioPlayer } from "./AudioPlayer.js";

interface FighterOptions {
  pos: Point
  size: number
  speed?: number
  projectile?: {
    speed: number
    size: number
    image: HTMLImageElement
    explosionRadius: number
  }
  side: 'player' | 'enemy'
}

export abstract class Fighter extends Unit {

  readonly projectileSpeed: number
  readonly projectileSize: number
  readonly projectileImage: HTMLImageElement
  readonly projectileExplosion: number
  lastModel: number = 0

  constructor(options: FighterOptions) {
    super(options)
    this.projectileSpeed = options.projectile?.speed ?? -1
    this.projectileSize = options.projectile?.size ?? -1
    this.projectileImage = options.projectile?.image ?? new Image()
    this.projectileExplosion = options.projectile?.explosionRadius ?? -1
  }

  /**
   * Fires a projectile in given angle
   */
  protected _shoot(angle: number, audio?: { player: AudioPlayer, id: number }) {
    new Projectile({
      pos: this.pos,
      angle,
      speed: this.projectileSpeed,
      size: this.projectileSize,
      side: this.side,
      image: this.projectileImage,
      explosionRadius: this.projectileExplosion
    }, this, audio)
  }

}