import { Circle, Point } from '../utils/Geometry.js';
import { config } from '../config.js';
export class Room {
    edges;
    insides;
    entrances;
    spawnAreas;
    roomNumber;
    item;
    itemPos;
    enemies;
    _spawnPoint;
    _spawnSide;
    static randomItemPositions = config.room.randomItemPositions.map(a => new Point(a[0], a[1]));
    randomItemPositions = [];
    barriers;
    baseEnemies;
    constructor(roomNumber, edges, insides, entrances, spawnAreas, enemies, item, barriers = []) {
        this.edges = edges;
        this.insides = insides;
        this.entrances = entrances;
        this.spawnAreas = spawnAreas;
        this.roomNumber = roomNumber;
        this.barriers = barriers;
        this.item = item?.obj;
        this.itemPos = item?.pos;
        if (this.item !== undefined) {
            if (this.itemPos !== undefined) {
                this.item.pos = this.itemPos;
            }
            else {
                this.randomItemPositions = Room.randomItemPositions
                    .filter(a => !this.circleCollision(new Circle(a, config.items.size)));
                if (this.randomItemPositions.length === 0) {
                    throw new Error(`No possible item positions found in room ${roomNumber}`);
                }
            }
        }
        this._spawnPoint = this.entrances[0].spawnPoint;
        this._spawnSide = this.entrances[0].position;
        this.baseEnemies = enemies;
        this.enemies = this.randomizeUnitCount(this.baseEnemies);
    }
    load(usedEntrance) {
        if (this.item !== undefined) {
            if (this.itemPos === undefined) {
                this.item.pos =
                    this.randomItemPositions[~~(Math.random() * this.randomItemPositions.length)];
            }
        }
        for (const e of this.entrances) {
            if (e.position === usedEntrance) {
                this._spawnPoint = e.spawnPoint;
                this._spawnSide = e.position;
            }
        }
        this.enemies = this.randomizeUnitCount(this.baseEnemies);
    }
    randomizeUnitCount(units) {
        const obj = {
            drone: 0,
            droid: 0,
            jumper: 0
        };
        for (const unitType in units) {
            const amount = units[unitType];
            const maxOffset = amount * config.room.enemyCountOffset;
            const offset = ~~(Math.random() * maxOffset);
            obj[unitType] = amount - maxOffset / 2 + offset;
        }
        return obj;
    }
    deleteEdge(r) {
        this.edges = this.edges.filter(a => !r.equals(a));
    }
    get spawnPoint() {
        return this._spawnPoint;
    }
    get spawnSide() {
        return this._spawnSide;
    }
    draw(ctx) {
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i].draw(ctx);
        }
        for (let i = 0; i < this.insides.length; i++) {
            this.insides[i].draw(ctx);
        }
        if (this.item !== undefined) {
            this.item.draw(ctx);
        }
    }
    get hasBarriers() {
        return this.barriers.length !== 0;
    }
    checkIfBarrierTriggered(hitbox) {
        return this.barriers.some(a => a.checkIfTriggered(hitbox));
    }
    circleCollision(c, checkInsides) {
        for (let i = 0; i < this.edges.length; i++) {
            if (this.edges[i].circleCollision(c)) {
                return true;
            }
        }
        for (let i = 0; i < this.entrances.length; i++) {
            if (this.entrances[i].circleCollision(c)) {
                return true;
            }
        }
        for (let i = 0; i < this.barriers.length; i++) {
            if (this.barriers[i].circleCollision(c)) {
                return true;
            }
        }
        if (checkInsides === true) {
            for (let i = 0; i < this.entrances.length; i++) {
                if (this.insides[i].circleCollision(c)) {
                    return true;
                }
            }
        }
        return false;
    }
    vectorCollision(v) {
        let minDist = Infinity;
        let minPoint;
        for (let i = 0; i < this.edges.length; i++) {
            const p = this.edges[i].vectorIntersection(v);
            if (p !== undefined) {
                const dist = p.calculateDistance(v.a);
                if (dist < minDist) {
                    minDist = dist;
                    minPoint = p;
                }
            }
        }
        for (let i = 0; i < this.entrances.length; i++) {
            const p = this.entrances[i].vectorIntersection(v);
            if (p !== undefined) {
                const dist = p.calculateDistance(v.a);
                if (dist < minDist) {
                    minDist = dist;
                    minPoint = p;
                }
            }
        }
        return minPoint;
    }
    checkIfOnEntrance(playerHitbox) {
        for (let i = 0; i < this.entrances.length; i++) {
            if (this.entrances[i].circleCollision(playerHitbox)) {
                return {
                    pos: this.entrances[i].getEntryPosition(playerHitbox.center),
                    room: this.entrances[i].nextRoom,
                    side: this.entrances[i].position
                };
            }
        }
        return false;
    }
}
