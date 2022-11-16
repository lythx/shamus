import { config } from "./config.js";
import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'

const infinity = 10000000
const player = new Player({ x: 0, y: 0 }, 0)

events.onMovementChange((isMoving, angle) => {
  if (!isMoving) {
    player.stop()
  } else {
    player.move(angle ?? 0, infinity)
  }
})
events.onAction('shoot', () => player.shoot())

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
  for (const e of Enemy.enemies) {
    e.ai(player.pos)
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, 2 * Math.PI);
    ctx.stroke();
  }
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)

new Enemy({
  pos: { x: 300, y: 300 },
  size: config.enemy.size,
  speed: config.enemy.speed,
  angle: 0
})
new Enemy({
  pos: { x: 400, y: 300 },
  size: config.enemy.size,
  speed: config.enemy.speed,
  angle: 0
})
new Enemy({
  pos: { x: 300, y: 400 },
  size: config.enemy.size,
  speed: config.enemy.speed,
  angle: 0
})
new Enemy({
  pos: { x: 550, y: 250 },
  size: config.enemy.size,
  speed: config.enemy.speed,
  angle: 0
})
