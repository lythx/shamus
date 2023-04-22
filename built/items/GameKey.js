import { config } from '../config.js';
import { GameItem } from './GameItem.js';
export class GameKey extends GameItem {
    type;
    constructor(type) {
        const img = new Image();
        img.src = `./assets/items/${config.gameKey.images[type]}.png`;
        super(config.gameKey.size, img);
        this.type = type;
    }
    static onCollect = () => undefined;
    _onCollect = () => {
        GameKey.onCollect(this.type);
    };
}
