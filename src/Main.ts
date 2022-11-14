import { config } from "./config.js";
import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { Unit } from "./Unit.js";

const infinity = 10000000
type Direction = 'up' | 'down' | 'left' | 'right'
type Action = 'shoot'
const player = new Player()
const directionKeys: { [direction in Direction]: string[] } = {
  up: ['w', 'W', 'ArrowUp'],
  down: ['s', 'S', 'ArrowDown'],
  left: ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight']
}
const actionKeys: { [action in Action]: string[] } = {
  shoot: [' ']
}
const actionFunctions: { [action in Action]: () => void } = {
  shoot: () => player.shoot()
}
const angles: { [direction in Direction]: number } = {
  right: 0,
  down: 90,
  left: 180,
  up: 270
}
const pressedKeys: Direction[] = []
const onMoveChange = () => {
  let angle = angles[pressedKeys[0]]
  if (angle === undefined) {
    player.stop()
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
  player.move(angle, infinity)
}

document.addEventListener('keydown', (e) => {
  for (const action in actionKeys) {
    if (actionKeys[action as Action].includes(e.key)) {
      actionFunctions[action as Action]()
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

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D
ctx.strokeStyle = "#FFFFFF";
const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
  ctx.stroke();
  for (const e of Projectile.playerProjectiles) {
    e.checkCollision()
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, 2 * Math.PI);
    ctx.stroke();
  }
  for (const e of Unit.enemies) {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, 2 * Math.PI);
    ctx.stroke();
  }
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)

new Enemy(300, 300, config.enemy.size, config.enemy.speed, 0)
new Enemy(100, 300, config.enemy.size, config.enemy.speed, 0)
new Enemy(200, 300, config.enemy.size, config.enemy.speed, 0)
new Enemy(400, 300, config.enemy.size, config.enemy.speed, 0)