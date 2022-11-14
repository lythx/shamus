import { Fighter } from "./Fighter.js";

export class Enemy extends Fighter {

  constructor(posX: number, posY: number, size: number, speed: number, angle: number) {
    super(posX, posY, size, speed, angle, 'enemy', [])
  }



}