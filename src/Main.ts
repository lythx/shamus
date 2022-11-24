import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Drawable, Point, Vector } from "./utils/Geometry.js";
import { room } from './Room.js'
import { renderDebug, renderRoom, renderRoomDebug, renderUnits } from "./Renderer.js";
import { Drone } from './enemies/Drone.js'

const infinity = 10000000
const player = new Player(new Point(0, 0))
const dbv = new Vector(new Point(42, 800), new Point(1100, 390))
const dbv2 = new Vector(new Point(0, 200), new Point(500, 400))
room.loadRoom(1)
let debug = true
const rects = room.getRectangles()
const p = room.vectorCollision(dbv)
const p2 = dbv.intersection(dbv2)
renderRoomDebug(rects.flatMap(a => a.vecs))

events.onMovementChange((isMoving, angle) => {
  if (!isMoving) {
    player.stop()
  } else {
    player.move(angle ?? 0, infinity)
  }
})
events.onAction('shoot', () => player.shoot())

const gameLoop = () => {
  for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
    Projectile.playerProjectiles[i].update()
  }
  for (let i = 0; i < Enemy.enemies.length; i++) {
    Enemy.enemies[i].update(player.pos)
  }
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
    if (p) {
      objects.push(p)
    }
    if (p2) {
      objects.push(p2)
    }
    objects.push(dbv, dbv2)
    renderDebug(objects)
  }
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)

new Drone(new Point(500, 300), 'blue')
new Drone(new Point(200, 200), 'blue')
Enemy.enemies.sort(a => player.pos.calculateDistance(a.pos))