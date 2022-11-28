import { config } from "./config.js";
import { Enemy } from "./Enemy.js";
import { Fighter } from "./Fighter.js";
import { models } from "./models.js";
import { Projectile } from "./Projectile.js";
import { room } from "./Room.js";
import { Point, Vector } from "./utils/Geometry.js";

type Direction = 'right' | 'downright' | 'down' | 'downleft' | 'left' | 'upleft' | 'up' | 'upright'
const infinity = 1000000

export class Player extends Fighter {

  projectileSpeed: number
  projectileSize: number
  nextShot: number = 0
  nextModelUpdate: number = 0
  onRoomChange: ((room: number, pos: Point) => void) | undefined
  readonly directions: { [key: number]: Direction } = {
    0: 'right',
    45: 'downright',
    90: 'down',
    135: 'downleft',
    180: 'left',
    225: 'upleft',
    270: 'up',
    315: 'upright'
  }
  readonly models: { [direction in Direction]: HTMLImageElement[] } = {
    right: [],
    downright: [],
    down: [],
    downleft: [],
    left: [],
    upleft: [],
    up: [],
    upright: []
  }
  readonly shotInterval = config.player.shotInterval
  currentDirection: typeof this.directions[keyof typeof this.directions] | undefined
  modelIndex = 0

  constructor(pos: Point) {
    const projectileImg = new Image()
    projectileImg.src = `./assets/player/${models.playerProjectile}.png`
    super({
      ...config.player,
      pos,
      side: 'player',
      projectile: {
        ...config.player.projectile,
        image: projectileImg
      }
    })
    this.projectileSpeed = config.player.projectile.speed
    this.projectileSize = config.player.projectile.size
    for (const key in this.models) {
      this.models[key as keyof typeof this.models] =
        models.player[key as keyof typeof models.player]
          .map(a => {
            const img = new Image()
            img.src = `./assets/player/${a}.png`
            return img
          })
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const model = this.currentDirection !== undefined ?
      this.models[this.currentDirection][this.modelIndex] : this.models.down[0]
    ctx.drawImage(model, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
  }

  update(): void {
    const entrance = room.checkIfOnEntrance(this.hitbox)
    if (entrance !== false) {
      this.onRoomChange?.(entrance.room, entrance.pos)
      return
    }
    this.checkCollision()
    if (Date.now() < this.nextModelUpdate) { return }
    this.nextModelUpdate = Date.now() + config.player.modelUpdateInterval
    this.modelIndex++
    this.modelIndex = this.currentDirection ?
      this.modelIndex % this.models[this.currentDirection].length : 0
  }

  checkCollision(): void {
    if (room.circleCollision(this.hitbox)) {
      this.destroy()
    }
    for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
      if (Projectile.enemyProjectiles[i].hitbox.circleCollision(this.hitbox)) {
        this.destroy()
      }
    }
    for (let i = 0; i < Enemy.enemies.length; i++) {
      if (Enemy.enemies[i].hitbox.circleCollision(this.hitbox)) {
        this.destroy()
      }
    }
  }

  destroy(): void {
    console.log('d')
    // todo
  }

  /**
   * Stops unit movement
   */
  stop() {
    this.currentDirection = undefined
    this.tween?.stop()
  }

  move(angle: number, length: number): void {
    this.currentDirection = this.directions[angle]
    this.modelIndex = 0
    this._move(new Vector(this.pos, angle, infinity))
  }

  shoot(): void {
    if (this.nextShot > Date.now()) { return }
    this.nextShot = Date.now() + this.shotInterval
    this._shoot(this._angle)
  }

}