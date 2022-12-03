import { Point, Vector } from "./utils/Geometry.js"
import { Direction4, direction4Angles, direction8Angles } from './utils/Directions.js'
import { config } from "./config.js"

type Action = 'debug' | 'editor' | 'menu' | 'shoot'
type PadAction = 'debug' | 'menu' | 'shoot'
const movementListeners: ((isMoving: boolean, angle?: number) => void)[] = []
const movementKeys: { [direction in Direction4]: string[] } = config.controls.keyboard.movement
const actionKeys: { [action in Action]: string[] } = config.controls.keyboard.actions
const actionListeners: { action: Action, callback: () => void }[] = []
const pressedKeys: Direction4[] = []
let lastAngle: number | undefined

const onMoveChange = () => {
  let angle = direction4Angles[pressedKeys[0]]
  if (angle === undefined) {
    lastAngle = undefined
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
  lastAngle = angle
  for (const e of movementListeners) { e(true, angle) }
}

const emitActionEvent = (action: Action) => {
  for (const listener of actionListeners) {
    if (listener.action === action) {
      listener.callback()
    }
  }
}
document.addEventListener('keydown', (e) => {
  for (const action in actionKeys) {
    if (actionKeys[action as Action].includes(e.key)) {
      emitActionEvent(action as Action)
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
const padAngles = Object.values(direction8Angles)
const maxAngleDiff = Math.abs(padAngles[1] - padAngles[0]) / 2 // assume differences are even
const movementAxis: { x: number, y: number } =
  config.gamepad.axes[config.controls.gamepad.movementAxis as keyof typeof config.gamepad.axes]
const minMovementDetection = config.gamepad.minMovementDetection
const padActionButtons: { [action in PadAction]: number[] } = config.controls.gamepad.actions

// https://codepedia.info/detect-browser-in-javascript
const osPadSupport = () => {
  if (navigator.userAgent.match(/chrome|chromium|crios/i)) {
    return false
  }
  if (navigator.userAgent.match(/firefox|fxios/i)) {
    return true
  }
  if (navigator.userAgent.match(/safari/i)) {
    return true
  }
  if (navigator.userAgent.match(/opr\//i)) {
    return false
  }
  if (navigator.userAgent.match(/edg/i)) {
    return false
  }
  return false
}

window.addEventListener("gamepadconnected", () => {
  if (!osPadSupport()) { return }
  if (gamepad === undefined) {
    gamepad = navigator.getGamepads()[0] ?? undefined
    requestAnimationFrame(padPoll)
  }
});

window.addEventListener("gamepaddisconnected", () => {
  if (!osPadSupport()) { return }
  gamepad = navigator.getGamepads()[0] ?? undefined
});


const buttonState: { [action in PadAction]: boolean } = Object.fromEntries(
  Object.keys(padActionButtons).map(a => [a, false])) as any

const padPoll = () => {
  if (gamepad === undefined) { return }
  requestAnimationFrame(padPoll)
  for (const action in padActionButtons) {
    let isPressed = false
    for (let i = 0; i < padActionButtons[action as PadAction].length; i++) {
      if (gamepad.buttons[padActionButtons[action as PadAction][i]].pressed === true) {
        isPressed = true
        break
      }
    }
    if (buttonState[action as PadAction] !== isPressed) {
      buttonState[action as PadAction] = isPressed
      if (buttonState[action as PadAction]) { emitActionEvent(action as PadAction) }
    }
  }
  if (Math.abs(gamepad.axes[movementAxis.x]) < minMovementDetection &&
    Math.abs(gamepad.axes[movementAxis.y]) < minMovementDetection) {
    lastAngle = undefined
    pressedKeys.length = 0
    for (let i = 0; i < movementListeners.length; i++) { movementListeners[i](false) }
  } else {
    const angle = new Vector(new Point(0, 0),
      new Point(gamepad.axes[movementAxis.x], gamepad.axes[movementAxis.y])).angle
    let trimmedAngle = 0
    for (let i = 0; i < padAngles.length; i++) {
      if (Math.abs(padAngles[i] - angle) <= maxAngleDiff) {
        trimmedAngle = padAngles[i]
      }
    }
    if (lastAngle !== trimmedAngle) {
      lastAngle = trimmedAngle
      pressedKeys.length = 0
      for (let i = 0; i < movementListeners.length; i++) { movementListeners[i](true, trimmedAngle) }
    }
  }
}

export const events = {
  onMovementChange(callback: (isMoving: boolean, angle?: number) => void) {
    movementListeners.push(callback)
  },
  onAction(action: Action, callback: () => void) {
    actionListeners.push({ action, callback })
  }
}
