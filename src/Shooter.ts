import { Fighter } from "./Fighter.js";
import { Projectile } from "./Projectile.js";

interface ProjectileOptions {
  speed: number
  damage: number
}

export class Shooter extends Fighter {

  readonly shotSpeed: number
  readonly shotDamage: number

  constructor(posX: number, posY: number, size: number, speed: number,
    shotOptions: ProjectileOptions, angle: number, side: 'player' | 'enemy', svgs: string[]) {
    super(posX, posY, size, speed, angle, side, svgs)
    this.shotSpeed = shotOptions.speed
    this.shotDamage = shotOptions.damage
  }

  shoot() {
    new Projectile({ x: this.x, y: this.y },
      this.angle, this.shotSpeed, this.shotDamage, this.side)
  }

}