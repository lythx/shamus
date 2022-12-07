import { config } from './config.js'
const sounds = config.audio

export class AudioPlayer {

  id = 0
  context: keyof typeof sounds
  audios: { [id: number]: HTMLAudioElement | undefined } = {}
  static isStopped = false
  static players: AudioPlayer[] = []

  constructor(context: keyof typeof sounds) {
    this.context = context
    AudioPlayer.players.push(this)
  }

  static stop() {
    this.isStopped = true
    for (const e of this.players) {
      e.stopAll()
    }
  }

  static resume() {
    this.isStopped = false
    for (const e of this.players) {
      e.resumeAll()
    }
  }

  resumeAll() {
    for (const key in this.audios) {
      this.audios[key]?.play?.()
    }
  }

  stopAll() {
    for (const key in this.audios) {
      this.stop(Number(key))
    }
  }

  play(soundName: string, forcePlay: boolean = false, loop: boolean = false, delay?: number): number {
    if (!forcePlay && AudioPlayer.isStopped) { return -1 }
    const source: string = (sounds[this.context] as any)[soundName]
    const audio = new Audio(`./assets/audio/${this.context}/${source}`)
    audio.volume = 0.1 
    this.id = (this.id + 1) % 30
    if (delay !== undefined) {
      setTimeout(() => audio.play(), delay)
    } else {
      audio.play()
    }
    if (loop) {
      audio.onended = () => audio.play()
    } else {
      audio.onended = () => {
        this.stop(this.id)
      }
    }
    this.audios[this.id] = audio
    return this.id
  }

  stop(id: number) {
    const audio = this.audios[id]
    if (audio === undefined) { return }
    audio.onended = null
    audio.pause()
    audio.remove()
    this.audios[id] = undefined
  }

}