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
                debug: ['Control'],
                editor: ['p']
            },
            changeDifficulty: ' '
        },
        gamepad: {
            movementAxis: 'left',
            actions: {
                shoot: [5, 7, 1],
                menu: [4],
                debug: [9]
            },
            changeDifficulty: 1
        }
    },
    room: {
        start: 0,
        startSide: 'right',
        enemyCountOffset: 0.5,
        randomItemPositions: [
            [415, 140], [415, 400], [415, 660],
            [700, 140], [700, 400], [700, 660],
            [985, 140], [985, 400], [985, 660]
        ],
        movingBarrier: {
            width: 70,
            gapWidth: 40,
            speed: 130,
            color: 'rgb(152, 222, 245)',
            resetTime: 4000
        },
        winningRoom: 38 // Transition from last room (last + 1)
    },
    items: {
        size: 30
    },
    intro: {
        list: [
            ['items/keyhole_green.png', 'Keyhole'],
            ['items/key_green.png', 'Key'],
            ['items/mystery_item_green.png', 'Mystery?'],
            ['items/extra_life_green.png', 'Extra Life'],
            ['intro/droid.png', 'Robo-Droid'],
            ['intro/shadow.png', 'Shadow'],
            ['intro/drone.png', 'Spiral Drones'],
            ['intro/jumper.png', 'Snap Jumpers'],
        ],
        controls: [
            ['Move', 'WASD, ArrowKeys, Left pad axis'],
            ['Shot', 'Space, Pad A, Pad RB, Pad RT'],
            ['Pause', 'Escape, Pad LB'],
            ['Change difficulty', 'Space, Pad A']
        ]
    },
    audio: {
        player: {
            shot: 'shot.mp3',
            step: 'step.mp3',
            death: 'death.mp3'
        },
        shadow: {
            spawn: 'spawn.mp3',
            step: 'step.mp3'
        },
        drone: {
            shot: 'shot.mp3'
        },
        droid: {
            shot: 'shot.mp3'
        },
        other: {
            itemCollect: 'item_collect.mp3',
            keyCollect: 'key_collect.mp3',
            explosion: 'explosion.mp3'
        }
    },
    difficulties: ['novice', 'experienced', 'advanced', 'expert'],
    speedMultipliers: {
        novice: 18,
        experienced: 26,
        advanced: 36,
        expert: 50
    },
    wallUpdateInterval: 100,
    explosionRadius: 25,
    explosionModelChange: 100,
    aiShotFriendDetectionWidth: 100,
    lifesAtStart: 5,
    lifesLimit: 12,
    killScore: 5,
    clearRoomScore: 200,
    aiNoTargetMoveLength: 150,
    aiDelay: 3000,
    aiTargetMoveLength: 300,
    aiCollisionCheckInterval: 100,
    player: {
        modelUpdateInterval: 50,
        size: 25,
        shotInterval: 100,
        speed: 150,
        roomClearSpeed: 250,
        projectile: {
            speed: 1100,
            size: 10,
            explosionRadius: 50
        }
    },
    droid: {
        movementOffset: 100,
        modelUpdateInterval: 150,
        size: 25,
        speed: 90,
        maxShotAngleOffset: 20,
        projectile: {
            speed: 250,
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
        speed: 70,
        maxShotAngleOffset: 30,
        projectile: {
            speed: 250,
            size: 5,
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
        jumpLength: 70,
        jumpLengthOffset: 50,
        speed: 0,
        jumpTime: 30,
        ai: {
            range: 500,
            updateInterval: 200,
            updateIntervalOffset: 100
        }
    },
    shadow: {
        spawnTimeout: 10000,
        modelUpdateInterval: 200,
        movementOffset: 30,
        size: 25,
        speed: 150,
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
            red: 'key_red',
            brown: 'key_brown'
        }
    },
    keyHole: {
        size: 30,
        images: {
            purple: 'keyhole_purple',
            red: 'keyhole_red',
            brown: 'keyhole_brown'
        }
    },
    debugColor: "#FFFFFF",
    debugDuration: 500
};
