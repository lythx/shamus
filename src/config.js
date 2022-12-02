export const config = {
  debug: {
    colours: {
      point: '#FF0000',
      rectangle: '#FFFFFF',
      circle: '#FFFFFF',
      vector: '#FFFFFF'
    }
  },
  gamepad: {
    axes: {
      left: { x: 0, y: 1 },
      right: { x: 2, y: 3 }
    },
    minMovementDetection: 0.1
  },
  controls: {
    keyboard: {
      movement: {
        up: ['w', 'W', 'ArrowUp'],
        down: ['s', 'S', 'ArrowDown'],
        left: ['a', 'A', 'ArrowLeft'],
        right: ['d', 'D', 'ArrowRight']
      },
      actions: {
        shoot: [' '],
        menu: ['Escape'],
        debug: ['Control'], // TODO check if works
        editor: ['p']
      }
    },
    gamepad: {
      movementAxis: 'left', // left or right
      actions: {
        shoot: [-1],
        menu: [-1],
        debug: [-1],
        editor: [-1]
      }
    }
  },









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
  aiNoTargetMoveLength: 150,
  shotTimeoutOnRoomLoad: 3000,
  aiTargetMoveLength: 300,
  aiCollisionCheckInterval: 100,
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
    movementOffset: 100,
    modelUpdateInterval: 150,
    size: 25,
    speed: 100,
    maxShotAngleOffset: 20,
    projectile: {
      speed: 300,
      size: 5,
      modelPath: 'droid/projectile',
      explosionRadius: 5
    },
    ai: {
      range: 100,
      shotInterval: 3000,
      shotIntervalOffset: 2000,
      /** msec */
      updateInterval: 500,
      updateIntervalOffset: 150
    }
  },
  drone: {
    movementOffset: 100,
    modelUpdateInterval: 40,
    size: 25,
    speed: 100,
    maxShotAngleOffset: 30,
    projectile: {
      speed: 250,
      size: 5,
      modelPath: 'drone/projectile_blue',
      explosionRadius: 5
    },
    ai: {
      range: 300,
      shotInterval: 8000,
      shotIntervalOffset: 4000,
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
    spawnTimeout: 10000,
    modelUpdateInterval: 500,
    movementOffset: 30,
    size: 25,
    speed: 180,
    projectile: {
      speed: 0,
      size: 0,
      modelPath: 'drone/projectile',
      explosionRadius: 0
    },
    reviveTimout: 5000,
    ai: {
      range: 300,
      shotInterval: 500,
      shotIntervalOffset: 1000,
      /** msec */
      updateInterval: 500,
      updateIntervalOffset: 150
    }
  },
  extraLife: {
    size: 30,
    image: 'extra_life'
  },
  mysteryItem: {
    size: 30,
    maxPoints: 5,
    image: 'mystery_item'
  },
  gameKey: {
    size: 30,
    images: {
      purple: 'key_purple',
      blue: 'key_blue',
      yellow: 'key_yellow'
    }
  },
  keyHole: {
    size: 30,
    images: {
      purple: 'keyhole_purple',
      blue: 'keyhole_blue',
      yellow: 'keyhole_yellow'
    }
  },
  debugColor: "#FFFFFF",
  debugDuration: 500
}