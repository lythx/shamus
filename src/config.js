import { models } from './models.js'

export const config = {
  speedMultiplier: 20,
  aiMovementOffset: 100,
  aiShotFriendDetectionWidth: 100,
  aiMaxShotAngleOffset: 30,
  aiNoTargetMoveLength: 150,
  aiTargetMoveLength: 300,
  aiCollisionCheckInterval: 100,
  aiMinMovement: 50,
  aiMovementTargetDivisor: 2,
  player: {
    modelUpdateInterval: 50,
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
      updateInterval: 500,
      updateIntervalOffset: 30
    }
  },
  debugColor: "#FFFFFF",
  debugDuration: 500
}