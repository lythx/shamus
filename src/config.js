import { models } from './models.js'

export const config = {
  speedMultiplier: 20,
  wallBorderWidth: 100,
  aiMovementOffset: 100,
  wallUpdateInterval: 100,
  aiShotFriendDetectionWidth: 100,
  aiMaxShotAngleOffset: 30,
  aiNoTargetMoveLength: 150,
  aiTargetMoveLength: 300,
  aiCollisionCheckInterval: 100,
  aiMinMovement: 50,
  aiMovementTargetDivisor: 2,
  player: {
    modelUpdateInterval: 50,
    size: 25,
    shotInterval: 200,
    speed: 500,
    projectile: {
      speed: 700,
      size: 10
    }
  },
  droid: {

  },
  drone: {
    modelUpdateInterval: 150,
    size: 25,
    speed: 100,
    projectile: {
      speed: 300,
      size: 5,
      modelPath: 'player/projectile'
    },
    ai: {
      range: 300,
      shotInterval: 500,
      shotIntervalOffset: 1000,
      /** msec */
      updateInterval: 500,
      updateIntervalOffset: 150
    }
  },
  jumper: {
    modelUpdateInterval: 500,
    size: 25,
    jumpLength: 100,
    jumpLengthOffset: 50,
    speed: 0,
    projectile: {
      speed: 0,
      size: 0,
      modelPath: ''
    },
    ai: {
      range: 500,
      updateInterval: 800,
      updateIntervalOffset: 600
    }
  },
  debugColor: "#FFFFFF",
  debugDuration: 500
}