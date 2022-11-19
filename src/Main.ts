import { config } from "./config.js";
import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Circle, Point } from "./Utils.js";
import { loadRoom, getPolygons } from './Room.js'
import { renderDebug, renderRoom, renderRoomDebug, renderUnits } from "./Renderer.js";
import { Drone } from './enemies/Drone.js'

const infinity = 10000000
const player = new Player(new Point(0, 0))
loadRoom(1)
let debug = true
const polygons = getPolygons()

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
    const hitboxes: Circle[] = [player.hitbox]
    for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
      hitboxes.push(Projectile.playerProjectiles[i].hitbox)
    }
    for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
      hitboxes.push(Projectile.enemyProjectiles[i].hitbox)
    }
    for (let i = 0; i < Enemy.enemies.length; i++) {
      hitboxes.push(Enemy.enemies[i].hitbox)
    }
    renderDebug(hitboxes)
  }
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
new Drone(new Point(500, 500), 'blue')
