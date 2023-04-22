import { config } from '../config.js';
import { GameItem } from './GameItem.js';
export class KeyHole extends GameItem {
    type;
    edgeToDelete;
    constructor(type, edgeToDelete) {
        const img = new Image();
        img.src = `./assets/items/${config.keyHole.images[type]}.png`;
        super(config.gameKey.size, img);
        this.type = type;
        this.edgeToDelete = edgeToDelete;
    }
    static onCollect = () => undefined;
    _onCollect = () => {
        KeyHole.onCollect(this.type, this.edgeToDelete);
    };
}
