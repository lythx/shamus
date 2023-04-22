import { config } from "../config.js";
import { models } from "../models.js";
import { Rectangle } from "../utils/Geometry.js";
export class WallEdge extends Rectangle {
    orientation;
    images;
    imageIndex = 0;
    nextImageUpdate = 0;
    constructor(a, c) {
        super(a, c);
        this.orientation = this.width < this.height ? 'vertical' : 'horizontal';
        this.images = models.wall[this.orientation].map(a => {
            const img = new Image();
            img.src = `./assets/wall/${a}.png`;
            return img;
        });
    }
    draw(ctx) {
        const pattern = ctx.createPattern(this.images[this.imageIndex], "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(this.a.x, this.a.y, this.width, this.height);
        if (this.nextImageUpdate > Date.now()) {
            return;
        }
        this.nextImageUpdate = Date.now() + config.wallUpdateInterval;
        this.imageIndex++;
        this.imageIndex = this.imageIndex % this.images.length;
    }
}
