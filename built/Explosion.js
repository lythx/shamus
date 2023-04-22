import { AudioPlayer } from "./AudioPlayer.js";
import { config } from "./config.js";
import { models } from "./models.js";
import { Circle } from "./utils/Geometry.js";
export class Explosion extends Circle {
    static explosions = [];
    static models = models.explosion.map(a => {
        const img = new Image();
        img.src = `./assets/explosion/${a}.png`;
        return img;
    });
    static audioPlayer = new AudioPlayer('other');
    currentModel = 0;
    nextModelChange;
    modelChangeInterval = config.explosionModelChange;
    constructor(pos) {
        super(pos, config.explosionRadius);
        Explosion.explosions.push(this);
        this.nextModelChange = Date.now() + this.modelChangeInterval;
        Explosion.audioPlayer.play('explosion');
    }
    draw(ctx) {
        ctx.drawImage(Explosion.models[this.currentModel], this.center.x - this.radius, this.center.y - this.radius, this.radius * 2, this.radius * 2);
        if (this.nextModelChange < Date.now()) {
            this.nextModelChange = Date.now() + this.modelChangeInterval;
            this.currentModel++;
            if (this.currentModel >= Explosion.models.length) {
                const index = Explosion.explosions.indexOf(this);
                if (index === -1) {
                    return;
                }
                Explosion.explosions.splice(index, 1);
            }
        }
    }
}
