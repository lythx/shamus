import { AudioPlayer } from '../AudioPlayer.js';
import { config } from '../config.js';
import { Enemy } from '../Enemy.js';
import { models } from '../models.js';
import { roomManager } from '../room/RoomManager.js';
import { Point, Rectangle, Vector } from '../utils/Geometry.js';
import { Rays } from '../utils/Rays.js';
export class Droid extends Enemy {
    nextAiUpdate = 0;
    nextShot = Date.now() + config.aiDelay;
    static audioPlayer = new AudioPlayer('droid');
    aiActivation = Date.now() + config.aiDelay;
    nextCollisionCheck = 0;
    models = {
        up: [],
        down: [],
        right: [],
        left: []
    };
    modelChange = 0;
    modelIndex = 0;
    modelChangeInterval = config.droid.modelUpdateInterval;
    aiRange = config.droid.ai.range;
    aiUpdateInterval = config.droid.ai.updateInterval;
    aiUpdateOffset = config.droid.ai.updateIntervalOffset;
    shotInterval = config.droid.ai.shotInterval;
    shotIntervalOffset = config.droid.ai.shotIntervalOffset;
    friendDetectionWidth = config.aiShotFriendDetectionWidth;
    movementOffset = config.droid.movementOffset;
    shotAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    directions = {
        0: 'right',
        90: 'down',
        180: 'left',
        270: 'up',
    };
    currentDirection = 'down';
    constructor(pos, colour) {
        super({
            ...config.droid,
            pos,
            projectile: {
                ...config.droid.projectile,
                modelPath: colour === 'blue' ? 'droid/projectile_blue' : 'droid/projectile_purple',
            }
        });
        for (const key in this.models) {
            this.models[key] =
                models.droid[key]
                    .map(a => {
                    const img = new Image();
                    img.src = `./assets/droid/${a}${colour}.png`;
                    return img;
                });
        }
    }
    update(playerPos) {
        this.collisionAi();
        this.updateModel();
        if (Date.now() < this.nextAiUpdate) {
            return;
        }
        this.shotAi(playerPos);
        this.movementAi(playerPos);
        const randOffset = Math.random() * this.aiUpdateOffset;
        this.nextAiUpdate = Date.now() +
            this.aiUpdateInterval + randOffset - (this.aiUpdateOffset / 2);
    }
    collisionAi() {
        if (Date.now() < this.nextCollisionCheck) {
            return;
        }
        this.nextCollisionCheck = Date.now() + config.aiCollisionCheckInterval;
        this.target.pos = this.pos;
        const rays = this.target.get();
        for (let i = 0; i < rays.length; i++) {
            if ((roomManager.vectorCollision(rays[i])?.calculateDistance(this.pos) ?? Infinity) < this.size * 2) {
                this.stop();
            }
        }
    }
    movementAi(playerPos) {
        if (this.aiActivation > Date.now() || playerPos.calculateDistance(this.pos) > this.aiRange) {
            this.untargetedMove();
        }
        else {
            this.targetedMove(playerPos);
        }
    }
    untargetedMove() {
        const maxTries = 10;
        let cDistance;
        let tries = 0;
        let v;
        do {
            const rand = this.randomizeTarget(this.pos);
            v = Vector.from(new Vector(this.pos, rand), config.aiNoTargetMoveLength);
            cDistance = this.checkCollision(v);
            tries++;
        } while ((cDistance ?? Infinity) < this.size * 4 && tries < maxTries);
        const length = Math.min(v.length, (cDistance ?? Infinity)) - this.size;
        if (tries === maxTries) {
            this.stop();
        }
        else {
            this.target.setTarget(new Vector(this.pos, v.angle, v.length).b, v.length);
            this.move(v.angle, length);
        }
    }
    targetedMove(p) {
        const maxTries = 10;
        let cDistance;
        let tries = 0;
        let v;
        do {
            const rand = this.randomizeTarget(p);
            v = Vector.from(new Vector(this.pos, rand), config.aiTargetMoveLength);
            cDistance = this.checkCollision(v);
            if (cDistance === 0) {
                this.untargetedMove();
                return;
            }
            tries++;
        } while ((cDistance ?? Infinity) < this.size * 4 && tries < maxTries);
        const length = Math.min(v.length, (cDistance ?? Infinity)) - this.size;
        if (tries === maxTries) {
            this.stop();
        }
        else {
            this.target.setTarget(new Vector(this.pos, v.angle, v.length).b, v.length);
            this.move(v.angle, length);
        }
    }
    randomizeTarget(target) {
        const randX = Math.random() * this.movementOffset;
        const randY = Math.random() * this.movementOffset;
        return new Point(target.x + randX - (this.movementOffset / 2), target.y + randY - (this.movementOffset / 2));
    }
    checkCollision(v) {
        const r = new Rays(this.pos, this.size);
        r.setTarget(v.b, v.length);
        const rays = r.get();
        let minCollision;
        for (let i = 0; i < rays.length; i++) {
            const p = roomManager.vectorCollision(rays[i]);
            if (p !== undefined) {
                const dist = p.calculateDistance(v.a);
                if ((minCollision ?? -1) < dist) {
                    minCollision = dist;
                }
            }
        }
        return minCollision;
    }
    updateModel() {
        if (Date.now() < this.modelChange) {
            return;
        }
        this.modelChange = Date.now() + this.modelChangeInterval;
        this.modelIndex++;
        this.modelIndex = this.currentDirection ?
            this.modelIndex % this.models[this.currentDirection].length : 0;
    }
    draw(ctx) {
        const model = this.currentDirection !== undefined ?
            this.models[this.currentDirection][this.modelIndex] : this.models.down[0];
        ctx.drawImage(model, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    }
    shotAi(playerPos) {
        if (Date.now() < this.nextShot) {
            return;
        }
        const { angle } = new Vector(this.pos, playerPos);
        let minDiff = Infinity;
        let direction = 0;
        for (const e of this.shotAngles) {
            const diff = Math.abs(angle - e);
            if (diff < minDiff) {
                minDiff = diff;
                direction = e;
            }
        }
        if (minDiff > config.droid.maxShotAngleOffset) {
            return;
        }
        const v = new Vector(this.pos, direction, playerPos.calculateDistance(this.pos));
        let a;
        let width;
        let height;
        if (direction === 180 || direction === 0) {
            a = new Point(Math.min(v.a.x, v.b.x), v.a.y - this.friendDetectionWidth / 2);
            width = v.length;
            height = this.friendDetectionWidth;
        }
        else {
            a = new Point(v.a.x - this.friendDetectionWidth / 2, Math.min(v.a.y, v.b.y));
            width = this.friendDetectionWidth;
            height = v.length;
        }
        const r = new Rectangle(a, width, height);
        for (let i = 0; i < Droid.enemies.length; i++) {
            if (Droid.enemies[i] !== this) {
                if (r.circleCollision(Droid.enemies[i].hitbox)) {
                    return;
                }
            }
        }
        const randOffset = Math.random() * this.shotIntervalOffset;
        this.nextShot = Date.now() +
            this.shotInterval + randOffset - (this.shotIntervalOffset / 2);
        const audioId = Droid.audioPlayer.play('shot');
        this._shoot(direction, { player: Droid.audioPlayer, id: audioId });
    }
}
