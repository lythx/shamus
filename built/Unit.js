import { config } from "./config.js";
import { Tween } from "./utils/Tween.js";
import { Circle, Vector } from "./utils/Geometry.js";
export class Unit {
    _pos;
    size;
    speed;
    tween;
    side;
    _angle = 0;
    hitbox;
    _debug = [];
    constructor(options) {
        this._pos = options.pos;
        this.size = options.size;
        this.speed = options.speed ?? -1;
        this.side = options.side;
        this.hitbox = new Circle(this._pos, this.size);
        this.tween = new Tween(this._pos, this._pos, this.speed);
    }
    _move(v) {
        this._angle = v.angle;
        const destination = v.b;
        this.tween.reset(this._pos, destination, this.speed);
        this.tween.onUpdate = (pos) => {
            this._pos = pos;
            this.hitbox.center = pos;
        };
    }
    get pos() {
        return this._pos;
    }
    set pos(pos) {
        this.hitbox.center = pos;
        this._pos = pos;
    }
    /**
     * Moves unit by a vector of given angle and length
     * @param angle Angle in degrees
     * @param length Vector length
     */
    move(angle, length) {
        const destination = new Vector(this._pos, angle, length);
        this._move(destination);
    }
    registerDebug(debugData, duration = config.debugDuration) {
        this._debug.push(debugData);
        setTimeout(() => this._debug = this._debug.filter(a => a !== debugData), duration);
    }
    get debug() {
        return this._debug;
    }
    /**
     * Stops unit movement
     */
    stop() {
        this.tween?.stop();
    }
    /**
     * Current x axis _position
     */
    get x() {
        return this._pos.x;
    }
    /**
     * Current y axis _position
     */
    get y() {
        return this._pos.y;
    }
    /**
     * Current unit angle in degrees
     */
    get angle() {
        return this._angle;
    }
}
