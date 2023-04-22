import { config } from '../config.js';
import { GameItem } from './GameItem.js';
export class MysteryItem extends GameItem {
    nextSizeUpdate = 0;
    sizeMultiplier = 1;
    constructor() {
        const img = new Image();
        img.src = `./assets/items/${config.mysteryItem.image}.png`;
        super(config.mysteryItem.size, img);
    }
    draw(ctx) {
        const s = this.size * this.sizeMultiplier;
        ctx.drawImage(this.image, this._pos.x - s, this._pos.y - s, s * 2, s * 2);
        if (this.nextSizeUpdate < Date.now()) {
            this.nextSizeUpdate = Date.now() + 200;
            this.sizeMultiplier = this.sizeMultiplier === 1 ? 0.7 : 1;
        }
    }
    actions = ['life', 'points'];
    static onCollect = () => undefined;
    _onCollect = () => {
        const action = this.actions[~~(Math.random() * this.actions.length)];
        MysteryItem.onCollect(action, action === 'life' ? 1 : ~~((Math.random() * 4) + 1) * 100 + 500);
    };
}
