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
  droid: {

  },
  drone: {
    size: 30,
    speed: 100,
    projectile: {
      speed: 300,
      size: 5
    },
    ai: {
      maxMovementOffset: 100,
      range: 300,
      /** msec */
      updateInterval: 1000,
      updateIntervalOffset: 700
    }
  },
  debugColor: "#FFFFFF"
}