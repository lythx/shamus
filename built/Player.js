import { config } from "./config.js";
import { Enemy } from "./Enemy.js";
import { Fighter } from "./Fighter.js";
import { models } from "./models.js";
import { Projectile } from "./Projectile.js";
import { roomManager } from "./room/RoomManager.js";
import { Vector } from "./utils/Geometry.js";
import { angle8Directions } from './utils/Directions.js';
import { AudioPlayer } from "./AudioPlayer.js";
const infinity = 1000000;
export class Player extends Fighter {
    projectileSpeed;
    projectileSize;
    nextShot = 0;
    nextModelUpdate = 0;
    lifes = config.lifesAtStart;
    static audioPlayer = new AudioPlayer('player');
    onRoomChange;
    isDead = false;
    stepAudioId = -1;
    onDeath = () => undefined;
    directions = angle8Directions;
    models = {
        right: [],
        downright: [],
        down: [],
        downleft: [],
        left: [],
        upleft: [],
        up: [],
        upright: []
    };
    deathModels = {
        right: [],
        downright: [],
        down: [],
        downleft: [],
        left: [],
        upleft: [],
        up: [],
        upright: []
    };
    shotInterval = config.player.shotInterval;
    currentDirection;
    modelIndex = 0;
    constructor(pos) {
        const projectileImg = new Image();
        projectileImg.src = `./assets/player/${models.playerProjectile}.png`;
        super({
            ...config.player,
            pos,
            side: 'player',
            projectile: {
                ...config.player.projectile,
                image: projectileImg
            }
        });
        this.projectileSpeed = config.player.projectile.speed;
        this.projectileSize = config.player.projectile.size;
        for (const key in this.models) {
            this.models[key] =
                models.player[key]
                    .map(a => {
                    const img = new Image();
                    img.src = `./assets/player/${a}.png`;
                    return img;
                });
            this.deathModels[key]
                = models.player[key].map(a => {
                    const img = new Image();
                    img.src = `./assets/player/${a}dead.png`;
                    return img;
                });
        }
    }
    draw(ctx) {
        let model;
        if (this.isDead) {
            model = this.currentDirection !== undefined ?
                this.deathModels[this.currentDirection][this.modelIndex] : this.deathModels.down[0];
        }
        else {
            model = this.currentDirection !== undefined ?
                this.models[this.currentDirection][this.modelIndex] : this.models.down[0];
        }
        ctx.drawImage(model, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    }
    update() {
        const entrance = roomManager.checkIfOnEntrance(this.hitbox);
        if (entrance !== false) {
            this.onRoomChange?.(entrance.room, entrance.side, entrance.pos);
            return;
        }
        this.checkCollision();
        if (Date.now() < this.nextModelUpdate || this.isDead) {
            return;
        }
        this.nextModelUpdate = Date.now() + config.player.modelUpdateInterval;
        this.modelIndex++;
        this.modelIndex = this.currentDirection ?
            this.modelIndex % this.models[this.currentDirection].length : 0;
    }
    checkCollision() {
        if (roomManager.circleCollision(this.hitbox)) {
            this.destroy();
        }
        for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
            if (Projectile.enemyProjectiles[i].hitbox.circleCollision(this.hitbox)) {
                this.destroy();
            }
        }
        for (let i = 0; i < Enemy.enemies.length; i++) {
            if (Enemy.enemies[i].hitbox.circleCollision(this.hitbox)) {
                this.destroy();
            }
        }
    }
    revive() {
        this.isDead = false;
        this.modelIndex = 0;
    }
    destroy() {
        if (this.isDead) {
            return;
        }
        this.lifes--;
        this.isDead = true;
        this.stop();
        this.onDeath();
        Player.audioPlayer.play('death', true);
    }
    /**
     * Stops unit movement
     */
    stop() {
        Player.audioPlayer.stop(this.stepAudioId);
        if (!this.isDead) {
            this.currentDirection = undefined;
        }
        this.tween?.stop();
    }
    move(angle) {
        if (this.isDead) {
            return;
        }
        Player.audioPlayer.stop(this.stepAudioId);
        this.stepAudioId = Player.audioPlayer.play('step');
        this.currentDirection = this.directions[angle];
        this.modelIndex = 0;
        this._move(new Vector(this.pos, angle, infinity));
    }
    shoot() {
        if (this.nextShot > Date.now() || this.isDead) {
            return;
        }
        Player.audioPlayer.play('shot');
        this.tween.pause();
        setTimeout(() => this.tween.resume(), 100);
        this.nextShot = Date.now() + this.shotInterval;
        this._shoot(this._angle);
    }
}
