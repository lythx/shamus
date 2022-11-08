import { Player } from "./Player"
import { Vector } from "./Utils"

type Direction = 'up' | 'down' | 'left' | 'right'
const player = new Player()
const actions: { [key in Direction]: string[] } = {
  up: ['w', 'W', 'ArrowUp'],
  down: ['s', 'S', 'ArrowDown'],
  left: ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight']
}
const angles: { [key in Direction]: number } = {
  up: 0,
  left: 90,
  down: 180,
  right: 270
}
const pressedKeys: Direction[] = []
const onMoveChange = () => {
  let angle = angles[pressedKeys[0]]
  const angle2 = angles[pressedKeys[1]]
  if (Math.abs(angle - angle2) !== 180) {
    angle = (angle + angle2) / 2
  }
  const destination = new Vector({ x: player.x, y: player.y }, angle, 100).b
  player.move(destination)
}

document.addEventListener('keydown', (e) => {
  for (const action in actions) {
    if (actions[action as Direction].includes(e.key)) {
      if (!pressedKeys.includes(action as Direction)) {
        pressedKeys.push(action as Direction)
        onMoveChange()
      }
    }
  }
})

document.addEventListener('keyup', (e) => {
  for (const action in actions) {
    if (actions[action as Direction].includes(e.key)) {
      const index = pressedKeys.indexOf(action as Direction)
      if (index !== -1) {
        pressedKeys.splice(index, 1)
        onMoveChange()
      }
    }
  }
})
