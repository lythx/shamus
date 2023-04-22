import { Enemy } from "./Enemy.js";
import { roomManager } from "./room/RoomManager.js";
import { Unit } from "./Unit.js";
import { Circle, math } from "./utils/Geometry.js";
const infinty = 10000000;
export class Projectile extends Unit {
    static playerProjectiles = [];
    static enemyProjectiles = [];
    image;
    shooter;
    explosionRadius;
    audio;
    constructor(options, shooter, audio) {
        super(options);
        this.move(options.angle, infinty);
        this.side === 'player' ? Projectile.playerProjectiles.push(this)
            : Projectile.enemyProjectiles.push(this);
        this.image = options.image;
        this.shooter = shooter;
        this.explosionRadius = options.explosionRadius;
        this.audio = audio;
    }
    update() {
        this.handleCollision();
    }
    /**
     * Hangles collision with walls and opposite fighters and projectiles
     */
    handleCollision() {
        if (this.side === 'player') {
            for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
                if (Projectile.enemyProjectiles[i].hitbox.circleCollision(this.hitbox)) {
                    Projectile.enemyProjectiles[i].destroy();
                }
            }
        }
        for (let i = 0; i < Enemy.enemies.length; i++) {
            if (Enemy.enemies[i] === this.shooter) {
                continue;
            }
            if (Enemy.enemies[i].hitbox.circleCollision(this.hitbox)) {
                this.explode();
            }
        }
        if (roomManager.circleCollision(this.hitbox)) {
            this.explode();
        }
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(math.degToRad(this.angle));
        ctx.drawImage(this.image, -this.size * 3, -this.size * 0.75, this.size * 6, this.size * 1.5);
        ctx.restore();
    }
    explode() {
        const impact = new Circle(this.pos, this.explosionRadius);
        this.registerDebug(impact);
        for (let i = 0; i < Enemy.enemies.length; i++) {
            if (Enemy.enemies[i] === this.shooter) {
                continue;
            }
            if (Enemy.enemies[i].hitbox.circleCollision(impact)) {
                Enemy.enemies[i].destroy();
            }
        }
        this.destroy();
    }
    /**
     * Stops listeners and unloads object from memory
     */
    destroy() {
        if (this.audio !== undefined) {
            this.audio.player.stop(this.audio.id);
        }
        this.tween?.stop();
        if (this.side === 'enemy') {
            const index = Projectile.enemyProjectiles.indexOf(this);
            if (index === -1) {
                return;
            }
            Projectile.enemyProjectiles.splice(index, 1);
        }
        else {
            const index = Projectile.playerProjectiles.indexOf(this);
            if (index === -1) {
                return;
            }
            Projectile.playerProjectiles.splice(index, 1);
        }
    }
}
