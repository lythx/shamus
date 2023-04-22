export class Timer {
    startTimestamp = -1;
    endTimestamp = -1;
    static isStopped = false;
    totalDuration = -1;
    isStarted = false;
    savedRemainingTime = -1;
    isPaused = false;
    isStopped = false;
    onEnd;
    onUpdate;
    static timers = [];
    constructor() {
        Timer.timers.push(this);
    }
    static pause() {
        Timer.isStopped = true;
        for (let i = 0; i < this.timers.length; i++) {
            this.timers[i].pause();
        }
    }
    static resume() {
        Timer.isStopped = false;
        for (let i = 0; i < this.timers.length; i++) {
            this.timers[i].resume();
        }
    }
    start(duration) {
        this.startTimestamp = Date.now();
        this.endTimestamp = this.startTimestamp + duration;
        this.totalDuration = duration;
        this.cycle();
        this.isStarted = true;
        if (Timer.isStopped) {
            this.pause();
        }
        return this;
    }
    pause() {
        if (!this.isStarted || this.isPaused) {
            return;
        }
        this.savedRemainingTime = this.remainingTime;
        this.isPaused = true;
    }
    resume() {
        if (!this.isStarted || !this.isPaused) {
            return;
        }
        this.endTimestamp = Date.now() + this.savedRemainingTime;
        this.isPaused = false;
        this.cycle();
    }
    stop() {
        this.isStopped = true;
    }
    get remainingTime() {
        const t = this.endTimestamp - Date.now();
        return t < 0 ? 0 : t;
    }
    get passedTime() {
        return this.totalDuration - this.remainingTime;
    }
    get remainingTimeRatio() {
        return this.remainingTime / this.totalDuration;
    }
    get passedTimeRatio() {
        return this.passedTime / this.totalDuration;
    }
    cycle() {
        const callback = () => {
            if (this.isPaused) {
                return;
            }
            if (Date.now() > this.endTimestamp || this.isStopped) {
                this.onUpdate?.();
                this.onEnd?.(this.isStopped);
                this.onUpdate = undefined;
                this.onEnd = undefined;
                const index = Timer.timers.indexOf(this);
                if (index !== -1) {
                    Timer.timers.splice(index, 1);
                }
                return;
            }
            this.onUpdate?.();
            requestAnimationFrame(callback);
        };
        requestAnimationFrame(callback);
    }
}
