import { Timer } from "./Timer.js";
import { Vector } from "./Geometry.js";
export class Tween {
    timer;
    static speedMultiplier;
    vector;
    destination;
    currentPosition;
    onUpdate;
    onEnd;
    constructor(start, end, speed) {
        this.vector = new Vector(start, end);
        this.timer = new Timer().start((this.vector.length * 10000) / (speed * Tween.speedMultiplier));
        this.currentPosition = start;
        this.destination = end;
        this.timer.onUpdate = () => {
            const length = this.vector.length * this.timer.passedTimeRatio;
            this.currentPosition = Vector.from(this.vector, length).b;
            this.onUpdate?.(this.currentPosition);
        };
        this.timer.onEnd = () => {
            this.currentPosition = this.destination;
            this.onEnd?.();
        };
    }
    reset(start, end, speed) {
        this.destination = this.currentPosition;
        this.timer.stop();
        this.vector = new Vector(start, end);
        this.timer = new Timer().start((this.vector.length * 10000) / (speed * Tween.speedMultiplier));
        this.currentPosition = start;
        this.destination = end;
        this.timer.onUpdate = () => {
            const length = this.vector.length * this.timer.passedTimeRatio;
            this.currentPosition = Vector.from(this.vector, length).b;
            this.onUpdate?.(this.currentPosition);
        };
        this.timer.onEnd = () => {
            this.currentPosition = this.destination;
            this.onEnd?.();
        };
    }
    pause() {
        this.timer.pause();
    }
    resume() {
        this.timer.resume();
    }
    get remainingTime() {
        return this.timer.remainingTime;
    }
    get passedTime() {
        return this.timer.passedTime;
    }
    get remainingTimeRatio() {
        return this.timer.remainingTimeRatio;
    }
    get passedTimeRatio() {
        return this.timer.passedTimeRatio;
    }
    stop() {
        this.destination = this.currentPosition;
        this.timer.stop();
        this.onUpdate = undefined;
    }
}
