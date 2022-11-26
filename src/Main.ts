import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Drawable, Point } from "./utils/Geometry.js";
import { room } from './Room.js'
import { renderDebug, renderRoom, renderRoomDebug, renderUi, renderUnits } from "./Renderer.js";
import { Drone } from './enemies/Drone.js'
import { Jumper } from './enemies/Jumper.js'

const infinity = 10000000
const player = new Player(new Point(100, 400))
room.loadRoom(0)
let debug = false
let roomEdges = room.getEdges()
let roomInsides = room.getInsides()
renderRoom(roomInsides)
renderUi({
  score: 123456789,
  lifes: 3,
  room: 0,
  level: 'black'
})

events.onMovementChange((isMoving, angle) => {
  if (!isMoving) {
    player.stop()
  } else {
    player.move(angle ?? 0, infinity)
  }
})
events.onAction('shoot', () => player.shoot())
events.onAction('debug', () => {
  debug = !debug
  if (!debug) {
    renderDebug([])
    renderRoomDebug([])
  } else {
    renderRoomDebug(roomEdges.flatMap(a => a.vecs))
  }
})

player.onRoomChange = (pos: Point, roomNumber: number) => {
  Projectile.playerProjectiles.length = 0
  Projectile.enemyProjectiles.length = 0
  Enemy.enemies.length = 0
  player.stop()
  player.pos = new Point(-1, -1)
  room.loadRoom(roomNumber)
  player.pos = pos
  roomEdges = room.getEdges()
  roomInsides = room.getInsides()
  renderRoom(roomInsides)
  renderUi({
    score: 123456789,
    lifes: 3,
    room: roomNumber,
    level: 'black'
  })
}

const gameLoop = () => {
  player.update()
  for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
    Projectile.playerProjectiles[i].update()
  }
  for (let i = 0; i < Enemy.enemies.length; i++) {
    Enemy.enemies[i].update(player.pos)
  }
  const objects: Drawable[] = [player]
  let index = 1
  for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
    objects[index++] = Projectile.playerProjectiles[i]
  }
  for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
    objects[index++] = Projectile.enemyProjectiles[i]
  }
  for (let i = 0; i < Enemy.enemies.length; i++) {
    objects[index++] = Enemy.enemies[i]
  }
  for (let i = 0; i < roomEdges.length; i++) {
    objects[index++] = roomEdges[i]
  }
  renderUnits(objects)
  renderRoom(roomInsides)
  if (debug) {
    const objects: Drawable[] = [player.hitbox]
    let index = 1
    for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
      objects[index++] = Projectile.playerProjectiles[i].hitbox
    }
    for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
      objects[index++] = Projectile.enemyProjectiles[i].hitbox
    }
    for (let i = 0; i < Enemy.enemies.length; i++) {
      const e = Enemy.enemies[i]
      objects[index++] = e.hitbox
      for (let j = 0; j < e.debug.length; j++) { objects[index++] = e.debug[j] }
    }
    renderDebug(objects)
  }
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)

new Drone(new Point(400, 400), 'blue')
new Jumper(new Point(300, 300))
Enemy.enemies.sort(a => player.pos.calculateDistance(a.pos))
