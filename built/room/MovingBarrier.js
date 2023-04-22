import { config } from '../config.js';
import { Point, Rectangle } from '../utils/Geometry.js';
import { Tween } from '../utils/Tween.js';
export class MovingBarrier {
    x;
    trigger;
    width = config.room.movingBarrier.width;
    hitboxes;
    tween;
    rectH = 10000;
    offset = 100;
    interval;
    gap = config.room.movingBarrier.gapWidth;
    constructor(x, shootSide) {
        this.x = x;
        this.hitboxes =
            [new Rectangle(new Point(x - this.width / 2, -(this.rectH + this.offset)), this.width, this.rectH),
                new Rectangle(new Point(x - this.width / 2, this.gap - this.offset), this.width, this.rectH)];
        if (shootSide === 'left') {
            this.trigger = new Rectangle(this.hitboxes[0].b, 10, 20000);
        }
        else {
            this.trigger = new Rectangle(new Point(this.hitboxes[0].a.x - 10, this.hitboxes[0].a.y), 10, 20000);
        }
        const initialAy = this.hitboxes[0].a.y;
        const initialDy = this.hitboxes[1].d.x;
        const leftX = this.hitboxes[0].a.x;
        this.tween = new Tween(this.hitboxes[0].a, this.hitboxes[1].d, config.room.movingBarrier.speed);
        this.tween.onUpdate = (pos) => {
            this.hitboxes =
                [new Rectangle(new Point(x - this.width / 2, pos.y), this.width, this.rectH),
                    new Rectangle(new Point(x - this.width / 2, pos.y + this.rectH + this.gap), this.width, this.rectH)];
        };
        this.interval = setInterval(() => {
            this.tween.reset(new Point(leftX, initialAy), new Point(leftX, initialDy), config.room.movingBarrier.speed);
        }, config.room.movingBarrier.resetTime);
    }
    circleCollision = (c) => this.hitboxes.some(a => a.circleCollision(c));
    checkIfTriggered = (c) => this.trigger.circleCollision(c);
    draw(ctx) {
        const initialFillStyle = ctx.fillStyle;
        ctx.fillStyle = config.room.movingBarrier.color;
        for (const e of this.hitboxes) {
            ctx.fillRect(e.a.x, e.a.y, e.width, e.height);
        }
        ctx.fillStyle = initialFillStyle;
    }
    destroy() {
        clearInterval(this.interval);
        this.tween.stop();
    }
}
