import { Projectile } from "./Projectile.js";
import { Unit } from "./Unit.js";
export class Fighter extends Unit {
    projectileSpeed;
    projectileSize;
    projectileImage;
    projectileExplosion;
    lastModel = 0;
    constructor(options) {
        super(options);
        this.projectileSpeed = options.projectile?.speed ?? -1;
        this.projectileSize = options.projectile?.size ?? -1;
        this.projectileImage = options.projectile?.image ?? new Image();
        this.projectileExplosion = options.projectile?.explosionRadius ?? -1;
    }
    /**
     * Fires a projectile in given angle
     */
    _shoot(angle, audio) {
        new Projectile({
            pos: this.pos,
            angle,
            speed: this.projectileSpeed,
            size: this.projectileSize,
            side: this.side,
            image: this.projectileImage,
            explosionRadius: this.projectileExplosion
        }, this, audio);
    }
}
