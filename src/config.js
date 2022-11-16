import { models } from './models.js'

export const config = {
  speedMultiplier: 20,
  player: {
    size: 40,
    speed: 100,
    projectile: {
      speed: 150,
      size: 5
    },
    models: [models.player]
  },
  enemy: {
    size: 30,
    speed: 100
  }
}