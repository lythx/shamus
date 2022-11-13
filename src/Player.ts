import { config } from "./config.js";
import { Fighter } from "./Fighter.js";

export class Player extends Fighter {

  constructor() {
    super(0, 0, config.player.size, config.player.speed, 90, 'player', config.player.models)
  }

}