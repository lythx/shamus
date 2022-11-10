import { Player } from "./Player.js";
import { Vector } from "./Utils.js";
import { Unit } from "./Unit.js";
import { Timer } from "./Timer.js";

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
  if (angle === undefined) { return }
  const angle2 = angles[pressedKeys[1]]
  if (angle2 !== undefined && Math.abs(angle - angle2) !== 180) {
    angle = (angle + angle2) / 2
  }
  const destination = new Vector({ x: player.x, y: player.y }, angle, 100).b
  console.log(destination)
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

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

const gameLoop = () => {
  for (const e of Unit.activeUnits) {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, 2 * Math.PI);
    ctx.stroke();
  }
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)