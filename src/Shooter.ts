import { Fighter } from "./Fighter";
import { Projectile } from "./Projectile";

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

  shot() {
    new Projectile({ x: this.x, y: this.y },
      this.angle, this.shotSpeed, this.shotDamage, this.side)
  }

}