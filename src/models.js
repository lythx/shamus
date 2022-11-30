export const models = {
  wall: {
    horizontal: ['wall_horizontal1'],// 'wall_horizontal2', 'wall_horizontal3', 'wall_horizontal4'],
    vertical: ['wall_vertical1'],// 'wall_vertical2', 'wall_vertical3', 'wall_vertical4'],
    inside: {
      yellowCircle: 'yellow_circle'
    }
  },
  explosion: ['explosion1', 'explosion1', 'explosion1'],
  playerProjectile: 'projectile',
  player: {
    right: ['right1', 'right1', 'right2', 'right2'],
    downright: ['right1', 'right1', 'right2', 'right2'],
    down: ['front1', 'front2', 'front3', 'front2', 'front1', 'front4', 'front5', 'front4'],
    downleft: ['left1', 'left1', 'left2', 'left2'],
    left: ['left1', 'left1', 'left2', 'left2'],
    upleft: ['left1', 'left1', 'left2', 'left2'],
    up: ['back1', 'back2', 'back3', 'back2', 'back1', 'back4', 'back5', 'back4'],
    upright: ['right1', 'right1', 'right2', 'right2'],
  },
  drone: {
    purple: ['purple1', 'purple2'],
    blue: ['blue1', 'blue2']
  },
  droid: {
    up: ['back1', 'back2', 'back3', 'back4', 'back3', 'back2'],
    down: ['back1', 'back2', 'back3', 'back4', 'back3', 'back2'],
    left: ['left1', 'left2', 'left3'],
    right: ['left1', 'left2', 'left3']
  },
  jumper: {
    normal: 'normal',
    jump: 'jump'
  },
  shadow: {
    alive: ['shadow1', 'shadow2'],
    dead: ['shadow_dead1', 'shadow_dead2'],
  }
}