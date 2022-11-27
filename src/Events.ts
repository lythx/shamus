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

export const events = {
  onMovementChange(callback: (isMoving: boolean, angle?: number) => void) {
    movementListeners.push(callback)
  },
  onAction(action: Action, callback: () => void) {
    actionListeners.push({ action, callback })
  }
}
