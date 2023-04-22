import { AudioPlayer } from '../AudioPlayer.js';
import { config } from '../config.js';
import { Enemy } from '../Enemy.js';
import { models } from '../models.js';
import { roomManager } from '../room/RoomManager.js';
import { Point, Rectangle, Vector } from '../utils/Geometry.js';
import { Rays } from '../utils/Rays.js';
export class Drone extends Enemy {
    nextAiUpdate = 0;
    nextShot = Date.now() + config.aiDelay;
    aiActivation = Date.now() + config.aiDelay;
    nextCollisionCheck = 0;
    models;
    modelChange = 0;
    modelIndex = 0;
    static audioPlayer = new AudioPlayer('drone');
    modelChangeInterval = config.drone.modelUpdateInterval;
    aiRange = config.drone.ai.range;
    aiUpdateInterval = config.drone.ai.updateInterval;
    aiUpdateOffset = config.drone.ai.updateIntervalOffset;
    shotInterval = config.drone.ai.shotInterval;
    shotIntervalOffset = config.drone.ai.shotIntervalOffset;
    friendDetectionWidth = config.aiShotFriendDetectionWidth;
    movementOffset = config.drone.movementOffset;
    angles = [0, 90, 180, 270];
    constructor(pos, colour) {
        super({
            ...config.drone,
            pos,
            projectile: {
                modelPath: colour === 'blue' ? 'drone/projectile_blue' : 'drone/projectile_purple',
                ...config.drone.projectile
            }
        });
        this.models = models.drone[colour].map(a => {
            const img = new Image();
            img.src = `./assets/drone/${a}.png`;
            return img;
        });
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
        // for (let i = 0; i < Enemy.enemies.length; i++) {
        //   if (Enemy.enemies[i] === this) { continue }
        //   if (Enemy.enemies[i].hitbox.circleCollision(this.hitbox)) { return 0 }
        //   const dist = this.rayCollision(Enemy.enemies[i])
        //   if (dist !== undefined && (minCollision ?? -1) < dist) {
        //     minCollision = dist
        //   }
        // }
        return minCollision;
    }
    rayCollision(unit) {
        if (unit === this) {
            return;
        }
        let minCollision;
        const rays = this.target.get();
        const uRays = unit.target.get();
        for (let i = 0; i < uRays.length; i++) {
            this.registerDebug(uRays[i]);
        }
        for (let i = 0; i < rays.length; i++) {
            this.registerDebug(rays[i]);
            if (unit.hitbox.vectorCollision(rays[i])) {
                let dist = unit.pos.calculateDistance(this.pos);
                minCollision = dist;
            }
            for (let j = 0; j < uRays.length; j++) {
                const p = rays[i].intersection(uRays[j]);
                if (p !== undefined) {
                    this.registerDebug(p);
                    const dist = p.calculateDistance(this.pos);
                    if ((minCollision ?? -1) < dist) {
                        minCollision = dist;
                    }
                }
            }
        }
        return minCollision;
    }
    updateModel() {
        if (this.modelChange > Date.now()) {
            return;
        }
        this.modelChange = Date.now() + this.modelChangeInterval;
        this.modelIndex++;
        this.modelIndex %= this.models.length;
    }
    draw(ctx) {
        ctx.drawImage(this.models[this.modelIndex], this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    }
    shotAi(playerPos) {
        if (Date.now() < this.nextShot) {
            return;
        }
        const { angle } = new Vector(this.pos, playerPos);
        let minDiff = Infinity;
        let direction = 0;
        for (const e of this.angles) {
            const diff = Math.abs(angle - e);
            if (diff < minDiff) {
                minDiff = diff;
                direction = e;
            }
        }
        if (minDiff > config.drone.maxShotAngleOffset) {
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
        for (let i = 0; i < Drone.enemies.length; i++) {
            if (Drone.enemies[i] !== this) {
                if (r.circleCollision(Drone.enemies[i].hitbox)) {
                    return;
                }
            }
        }
        const randOffset = Math.random() * this.shotIntervalOffset;
        this.nextShot = Date.now() +
            this.shotInterval + randOffset - (this.shotIntervalOffset / 2);
        const audioId = Drone.audioPlayer.play('shot');
        this._shoot(direction, { player: Drone.audioPlayer, id: audioId });
    }
}
