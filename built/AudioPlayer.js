import { config } from './config.js';
const sounds = config.audio;
export class AudioPlayer {
    id = 0;
    context;
    audios = {};
    static isStopped = false;
    static players = [];
    constructor(context) {
        this.context = context;
        AudioPlayer.players.push(this);
    }
    static stop() {
        this.isStopped = true;
        for (const e of this.players) {
            e.stopAll();
        }
    }
    static resume() {
        this.isStopped = false;
        for (const e of this.players) {
            e.resumeAll();
        }
    }
    resumeAll() {
        for (const key in this.audios) {
            this.audios[key]?.play?.();
        }
    }
    stopAll() {
        for (const key in this.audios) {
            this.stop(Number(key));
        }
    }
    play(soundName, forcePlay = false, loop = false, delay) {
        if (!forcePlay && AudioPlayer.isStopped) {
            return -1;
        }
        const source = sounds[this.context][soundName];
        const audio = new Audio(`./assets/audio/${this.context}/${source}`);
        audio.volume = 0.1;
        this.id = (this.id + 1) % 30;
        if (delay !== undefined) {
            setTimeout(() => audio.play(), delay);
        }
        else {
            audio.play();
        }
        if (loop) {
            audio.onended = () => audio.play();
        }
        else {
            audio.onended = () => {
                this.stop(this.id);
            };
        }
        this.audios[this.id] = audio;
        return this.id;
    }
    stop(id) {
        const audio = this.audios[id];
        if (audio === undefined) {
            return;
        }
        audio.onended = null;
        audio.pause();
        audio.remove();
        this.audios[id] = undefined;
    }
}
