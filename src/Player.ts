import { config } from "./config.js";
import { Shooter } from "./Shooter.js";
import { Point } from "./Utils.js";

export class Player extends Shooter {

  constructor(pos: Point, angle: number) {
    super({
      ...config.player,
      pos,
      angle,
      side: 'player'
    })
  }

  shoot(): void {
    this._shoot(this._angle)
  }

}