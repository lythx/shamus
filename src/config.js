export const config = {
  startingRoom: 0,
  speedMultiplier: 20,
  wallUpdateInterval: 100,
  explosionRadius: 25,
  explosionModelChange: 100,
  aiShotFriendDetectionWidth: 100,
  lifesAtStart: 4,
  lifesLimit: 12,
  killScore: 5,
  clearRoomScore: 200,
  aiMaxShotAngleOffset: 30,
  aiNoTargetMoveLength: 150,
  shotTimeoutOnRoomLoad: 1500,
  aiTargetMoveLength: 300,
  aiCollisionCheckInterval: 100,
  aiMinMovement: 50,
  aiMovementTargetDivisor: 2,
  player: {
    modelUpdateInterval: 50,
    size: 25,
    shotInterval: 200,
    speed: 190,
    projectile: {
      speed: 700,
      size: 15,
      explosionRadius: 50
    }
  },
  droid: {

  },
  drone: {
    movementOffset: 100,
    modelUpdateInterval: 150,
    size: 25,
    speed: 100,
    projectile: {
      speed: 300,
      size: 5,
      modelPath: 'drone/projectile',
      explosionRadius: 5
    },
    ai: {
      range: 300,
      shotInterval: 5000,
      shotIntervalOffset: 2000,
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
    jumpTime: 30,
    projectile: {
      speed: 0,
      size: 0,
      modelPath: 'drone/projectile',
      explosionRadius: 0
    },
    ai: {
      range: 500,
      updateInterval: 200,
      updateIntervalOffset: 100
    }
  },
  shadow: {
    modelUpdateInterval: 500,
    movementOffset: 30,
    size: 25,
    speed: 200,
    projectile: {
      speed: 0,
      size: 0,
      modelPath: 'drone/projectile',
      explosionRadius: 0
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
  debugColor: "#FFFFFF",
  debugDuration: 500
}