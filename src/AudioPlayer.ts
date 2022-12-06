import { config } from './config.js'
const sounds = config.audio

export class AudioPlayer {

  context: keyof typeof sounds

  constructor(context: keyof typeof sounds) {
    this.context = context
  }

  play(soundName: string) {
    const source: string = (sounds[this.context] as any)[soundName]
    const audio = new Audio(`./assets/audio/${this.context}/${source}`)
    audio.play()
  }

}