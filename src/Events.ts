import { Point, Vector } from "./utils/Geometry.js"

type Direction = 'up' | 'down' | 'left' | 'right'
type Action = 'shoot' | 'debug' | 'editor'
const movementListeners: ((isMoving: boolean, angle?: number) => void)[] = []
const directionKeys: { [direction in Direction]: string[] } = {
  up: ['w', 'W', 'ArrowUp'],
  down: ['s', 'S', 'ArrowDown'],
  left: ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight']
}
const actionKeys: { [action in Action]: string[] } = {
  shoot: [' '],
  debug: ['r'],
  editor: ['p']
}
const actionListeners: { action: Action, callback: () => void }[] = []
const pressedKeys: Direction[] = []
const angles: { [direction in Direction]: number } = {
  right: 0,
  down: 90,
  left: 180,
  up: 270
}
const onMoveChange = () => {
  let angle = angles[pressedKeys[0]]
  if (angle === undefined) {
    for (const e of movementListeners) { e(false) }
    return
  }
  let angle2 = angles[pressedKeys[1]]
  if (angle2 !== undefined && Math.abs(angle - angle2) !== 180) {
    if (angle > angle2) {
      let temp = angle
      angle = angle2
      angle2 = temp
    }
    if (angle2 - angle > 180) {
      angle2 -= 360
    }
    angle = ((angle + angle2) / 2) % 360
  }
  if (angle === -45) { angle = 315 } //todo
  for (const e of movementListeners) { e(true, angle) }
}
document.addEventListener('keydown', (e) => {
  for (const action in actionKeys) {
    if (actionKeys[action as Action].includes(e.key)) {
      for (const listener of actionListeners) {
        if (listener.action === action) {
          listener.callback()
        }
      }
    }
  }
  for (const direction in directionKeys) {
    if (directionKeys[direction as Direction].includes(e.key)) {
      if (!pressedKeys.includes(direction as Direction)) {
        pressedKeys.push(direction as Direction)
        onMoveChange()
      }
    }
  }
})

document.addEventListener('keyup', (e) => {
  for (const action in directionKeys) {
    if (directionKeys[action as Direction].includes(e.key)) {
      const index = pressedKeys.indexOf(action as Direction)
      if (index !== -1) {
        pressedKeys.splice(index, 1)
        onMoveChange()
      }
    }
  }
})



let gamepad: Gamepad | undefined

window.addEventListener("gamepadconnected", (e) => {
  gamepad = navigator.getGamepads()[0] ?? undefined
});

const padAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360]
let lastAngle: number | undefined
const padPoll = () => {
  requestAnimationFrame(padPoll)
  if (gamepad === undefined) { return }
  if (Math.abs(gamepad.axes[0]) < 0.1 && Math.abs(gamepad.axes[1]) < 0.1) {
    for (const e of movementListeners) { e(false) }
  } else {
    console.log(gamepad.axes[1], gamepad.axes[0], new Vector(new Point(0, 0), new Point(gamepad.axes[0], gamepad.axes[1])).angle)
    const angle = new Vector(new Point(0, 0), new Point(gamepad.axes[0], gamepad.axes[1])).angle
    let trimmedAngle = 0
    for (let i = 0; i < padAngles.length; i++) {
      if (Math.abs(padAngles[i] - angle) <= 22.5) {
        trimmedAngle = padAngles[i]
      }
    }
    if (lastAngle !== trimmedAngle) {
      lastAngle = trimmedAngle  
      for (const e of movementListeners) { e(true, trimmedAngle) }
    }
  }
}

requestAnimationFrame(padPoll)


export const events = {
  onMovementChange(callback: (isMoving: boolean, angle?: number) => void) {
    movementListeners.push(callback)
  },
  onAction(action: Action, callback: () => void) {
    actionListeners.push({ action, callback })
  }
}
