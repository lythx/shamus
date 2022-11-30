import { config } from '../config.js'
import { Point } from '../utils/Geometry.js';
import { GameItem } from './GameItem.js'
import { GameKeyType } from './GameKey.js';


export class KeyHole extends GameItem {

  readonly type: GameKeyType

  constructor(pos: Point, type: GameKeyType) {
    const img = new Image()
    img.src = `./assets/items/${config.keyHole.images[type]}.png`
    super(pos, config.gameKey.size, img)
    this.type = type
  }

  static onCollect: (type: GameKeyType) => void = () => undefined
  protected _onCollect = () => {
    KeyHole.onCollect(this.type)
  };

}