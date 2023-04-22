import { Explosion } from "./Explosion.js";
import { Fighter } from "./Fighter.js";
import { Vector } from "./utils/Geometry.js";
import { Rays } from "./utils/Rays.js";
export class Enemy extends Fighter {
    static onKill = () => undefined;
    static enemies = [];
    target;
    moveAngles = [0, 90, 180, 270];
    maxAngleOffset;
    constructor(options, moveAngles) {
        if (options.projectile !== undefined) {
            const projectileImg = new Image();
            projectileImg.src = `./assets/${options.projectile.modelPath}.png`;
            super({ ...options, side: 'enemy', projectile: { ...options.projectile, image: projectileImg } });
        }
        else {
            super({ pos: options.pos, size: options.size, speed: options.speed, side: 'enemy' });
        }
        Enemy.enemies.push(this);
        if (moveAngles !== undefined) {
            this.moveAngles = moveAngles;
        }
        this.maxAngleOffset = Math.abs(this.moveAngles[1] - this.moveAngles[0]) / 2;
        this.target = new Rays(options.pos, options.size);
    }
    /**
     * Stops listeners and unloads object from memory
     */
    destroy() {
        this.tween?.stop();
        if (this.side === 'enemy') {
            const index = Enemy.enemies.indexOf(this);
            if (index === -1) {
                return;
            }
            Enemy.enemies.splice(index, 1);
            Enemy.onKill(Enemy.enemies.length === 0);
            new Explosion(this.pos);
        }
    }
    move(angle, length) {
        let trimmedAngle = 0;
        for (let i = 0; i < this.moveAngles.length; i++) {
            if (Math.abs(this.moveAngles[i] - angle) <= this.maxAngleOffset) {
                trimmedAngle = this.moveAngles[i];
                break;
            }
        }
        const v = new Vector(this.pos, trimmedAngle, length);
        this.target.setTarget(v.b, v.length + this.size);
        this._move(v);
    }
}
