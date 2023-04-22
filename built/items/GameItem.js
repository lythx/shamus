import { Circle, Point } from "../utils/Geometry.js";
export class GameItem {
    hitbox;
    image;
    _pos;
    size;
    static items;
    constructor(size, image) {
        this._pos = new Point(-1, -1);
        this.hitbox = new Circle(this._pos, size * 2);
        this.image = image;
        this.size = size;
    }
    set pos(pos) {
        this._pos = pos;
        this.hitbox = new Circle(this._pos, this.size * 2);
    }
    get pos() {
        return this.pos;
    }
    draw(ctx) {
        ctx.drawImage(this.image, this._pos.x - this.size, this._pos.y - this.size, this.size * 2, this.size * 2);
    }
    checkCollision(player) {
        if (player.hitbox.circleCollision(this.hitbox)) {
            this._onCollect();
        }
    }
}
