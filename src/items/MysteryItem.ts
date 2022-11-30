import { config } from '../config.js'
import { Point } from '../utils/Geometry.js'
import { GameItem } from './GameItem.js'

type MysteryItemAction = 'life' | 'points'

export class MysteryItem extends GameItem {

  constructor(pos: Point) {
    const img = new Image()
    img.src = `./assets/items/${config.mysteryItem.image}.png`
    super(pos, config.mysteryItem.size, img)
  }

  readonly actions: MysteryItemAction[] = ['life', 'points']
  static onCollect: (action: MysteryItemAction, amount: number) => void = () => undefined
  protected _onCollect = () => {
    const action = this.actions[~~(Math.random() * this.actions.length)]
    MysteryItem.onCollect(action, action === 'life' ? 1 : ~~((Math.random() * 4) + 1) * 100)
  };

}