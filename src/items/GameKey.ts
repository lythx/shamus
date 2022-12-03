import { config } from '../config.js'
import { Point } from '../utils/Geometry.js';
import { GameItem } from './GameItem.js'

export type GameKeyType = 'purple' | 'blue'

export class GameKey extends GameItem {

  readonly type: GameKeyType

  constructor( type: GameKeyType) {
    const img = new Image()
    img.src = `./assets/items/${config.gameKey.images[type]}.png`
    super(config.gameKey.size, img)
    this.type = type
  }

  static onCollect: (type: GameKeyType) => void = () => undefined
  protected _onCollect = () => {
    GameKey.onCollect(this.type)
  };

}