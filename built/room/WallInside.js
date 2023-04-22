import { models } from "../models.js";
import { Rectangle } from "../utils/Geometry.js";
export class WallInside extends Rectangle {
    image;
    constructor(a, c, style) {
        super(a, c);
        this.image = new Image();
        this.image.src = `./assets/wall/${models.wall.inside[style]}.png`;
    }
    draw(ctx) {
        const pattern = ctx.createPattern(this.image, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(this.a.x, this.a.y, this.width, this.height);
    }
}
