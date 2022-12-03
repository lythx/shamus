import { config } from '../config.js';
import { GameItem } from './GameItem.js'

export class ExtraLife extends GameItem {

  constructor() {
    const img = new Image()
    img.src = `./assets/items/${config.extraLife.image}.png`
    super(config.extraLife.size, img)
  }

  static onCollect: () => void = () => undefined
  protected _onCollect = () => {
    ExtraLife.onCollect()
  };

}