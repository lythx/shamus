import { config } from "./config.js";
import { Unit } from "./Unit.js";

export class Player extends Unit {

  constructor() {
    super(0, 0, config.player.size, config.player.speed, config.player.models)
  }

}