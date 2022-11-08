import { config } from "./config";
import { Unit } from "./Unit";

export class Player extends Unit {

  constructor() {
    super(0, 0, config.player.size, config.player.speed, config.player.model)
  }

}