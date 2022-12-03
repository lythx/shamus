import { config } from '../config.js'
import { Rectangle } from '../utils/Geometry.js';
import { GameItem } from './GameItem.js'
import { GameKeyType } from './GameKey.js';


export class KeyHole extends GameItem {

  readonly type: GameKeyType
  readonly edgeToDelete: Rectangle

  constructor(type: GameKeyType, edgeToDelete: Rectangle) {
    const img = new Image()
    img.src = `./assets/items/${config.keyHole.images[type]}.png`
    super(config.gameKey.size, img)
    this.type = type
    this.edgeToDelete = edgeToDelete
  }

  static onCollect: (type: GameKeyType, edgeToDelete: Rectangle) => void = () => undefined
  protected _onCollect = () => {
    KeyHole.onCollect(this.type, this.edgeToDelete)
  };

}