import { config } from "./config.js";
import { Shooter } from "./Shooter.js";

export class Player extends Shooter {

  constructor() {
    super(0, 0, config.player.size, config.player.speed, {
      speed: 300,
      damage: 10
    }, 90, 'player', config.player.models)
  }

}