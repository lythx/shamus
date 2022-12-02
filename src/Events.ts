import { Point, Vector } from "./utils/Geometry.js"
import { Direction4, direction4Angles } from './utils/Directions.js'
import { config } from "./config.js"

type Action = 'debug' | 'editor' | 'menu' | 'shoot'
const movementListeners: ((isMoving: boolean, angle?: number) => void)[] = []
const shotListeners: ((angle: number) => void)[] = []
const movementKeys: { [direction in Direction4]: string[] } = config.controls.keyboard.movement
let lastMoveAngle = 0
const actionKeys: { [action in Action]: string[] } = config.controls.keyboard.actions
const actionListeners: { action: Action, callback: () => void }[] = []
const pressedKeys: Direction4[] = []
const onMoveChange = () => {
  let angle = direction4Angles[pressedKeys[0]]
  if (angle === undefined) {
    for (const e of movementListeners) { e(false) }
    return
  }
  let angle2 = direction4Angles[pressedKeys[1]]
  if (angle2 !== undefined && Math.abs(angle - angle2) !== 180) {
    if (angle > angle2) {
      let temp = angle
      angle = angle2
      angle2 = temp
    }
    if (angle2 - angle > 180) {
      angle2 -= 360
    }
    angle = (((angle + angle2) / 2) + 360) % 360
  }
  console.log(angle)
  lastMoveAngle = angle
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
  for (const direction in movementKeys) {
    if (movementKeys[direction as Direction4].includes(e.key)) {
      if (!pressedKeys.includes(direction as Direction4)) {
        pressedKeys.push(direction as Direction4)
        onMoveChange()
      }
    }
  }
})

document.addEventListener('keyup', (e) => {
  for (const action in movementKeys) {
    if (movementKeys[action as Direction4].includes(e.key)) {
      const index = pressedKeys.indexOf(action as Direction4)
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
  onAction(action: Action, callback: () => void) {
    actionListeners.push({ action, callback })
  }
}
