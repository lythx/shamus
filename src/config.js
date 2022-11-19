import { models } from './models.js'

export const config = {
  speedMultiplier: 20,
  aiMovementOffset: 100,
  aiShotFriendDetectionWidth: 100,
  aiMaxShotAngleOffset: 30,
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
      range: 300,
      shotInterval: 500,
      shotIntervalOffset: 1000,
      /** msec */
      updateInterval: 1000,
      updateIntervalOffset: 700
    }
  },
  debugColor: "#FFFFFF"
}