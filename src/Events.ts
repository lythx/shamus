import { Point, Vector } from "./utils/Geometry.js"

type Direction = 'up' | 'down' | 'left' | 'right'
type Action = 'debug' | 'editor'
const movementListeners: ((isMoving: boolean, angle?: number) => void)[] = []
const shotListeners: ((angle: number) => void)[] = []
const directionKeys: { [direction in Direction]: string[] } = {
  up: ['w', 'W', 'ArrowUp'],
  down: ['s', 'S', 'ArrowDown'],
  left: ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight']
}
let lastMoveAngle = 0
const shotKey = ' '
const actionKeys: { [action in Action]: string[] } = {
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
  lastMoveAngle = angle
  for (const e of movementListeners) { e(true, angle) }
}
document.addEventListener('keydown', (e) => {
  if (e.key === shotKey) {
    for (let i = 0; i < shotListeners.length; i++) { shotListeners[i](lastMoveAngle) }
  }
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
let shotInterval = 100
let lastShot = 0
const movementXAxis = 0
const movementYAxis = 1
const shotXAxis = 2
const shotYAxis = 3
const padShot = (x: number, y: number) => {
  const date = Date.now()
  if (date < lastShot + shotInterval) { return }
  lastShot = date
  const angle = new Vector(new Point(0, 0), new Point(x, y)).angle
  let trimmedAngle = 0
  for (let i = 0; i < padAngles.length; i++) {
    if (Math.abs(padAngles[i] - angle) <= 22.5) {
      trimmedAngle = padAngles[i]
    }
  }
  for (let i = 0; i < shotListeners.length; i++) { shotListeners[i](trimmedAngle) }
}

const padPoll = () => {
  requestAnimationFrame(padPoll)
  if (gamepad === undefined) { return }
  if (Math.abs(gamepad.axes[shotXAxis]) > 0.1 || Math.abs(gamepad.axes[shotYAxis]) > 0.1) {
    padShot(gamepad.axes[shotXAxis], gamepad.axes[shotYAxis])
  }
  if (Math.abs(gamepad.axes[movementXAxis]) < 0.1 && Math.abs(gamepad.axes[movementYAxis]) < 0.1) {
    lastAngle = undefined
    for (let i = 0; i < movementListeners.length; i++) { movementListeners[i](false) }
  } else {
    const angle = new Vector(new Point(0, 0), new Point(gamepad.axes[movementXAxis], gamepad.axes[movementYAxis])).angle
    let trimmedAngle = 0
    for (let i = 0; i < padAngles.length; i++) {
      if (Math.abs(padAngles[i] - angle) <= 22.5) {
        trimmedAngle = padAngles[i]
      }
    }
    if (lastAngle !== trimmedAngle) {
      lastAngle = trimmedAngle
      for (let i = 0; i < movementListeners.length; i++) { movementListeners[i](true, trimmedAngle) }
    }
  }
}

requestAnimationFrame(padPoll)


export const events = {
  onMovementChange(callback: (isMoving: boolean, angle?: number) => void) {
    movementListeners.push(callback)
  },
  onShot(callback: (angle: number) => void) {
    shotListeners.push(callback)
  },
  onAction(action: Action, callback: () => void) {
    actionListeners.push({ action, callback })
  }
}
