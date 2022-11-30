import { config } from '../config.js';
import { Point } from '../utils/Geometry.js';
import { GameItem } from './GameItem.js'

export class ExtraLife extends GameItem {

  constructor(pos: Point) {
    const img = new Image()
    img.src = `./assets/items/${config.extraLife.image}.png`
    super(pos, config.extraLife.size, img)
    ExtraLife.items.push(this)
  }

  static onCollect: () => void = () => undefined
  protected _onCollect = () => {
    ExtraLife.onCollect()
  };

}