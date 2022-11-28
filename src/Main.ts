import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Circle, Drawable, Point, Rectangle } from "./utils/Geometry.js";
import { room } from './Room.js'
import { renderDebug, renderRoom, renderRoomDebug, renderUi, renderUnits } from "./Renderer.js";
import { Drone } from './enemies/Drone.js'
import { Jumper } from './enemies/Jumper.js'
import { Shadow } from './enemies/Shadow.js'
import { editor } from "./editor.js";
import { WallEdge } from "./WallEdge.js";
import { WallInside } from "./WallInside.js";
import { Explosion } from "./Explosion.js";
import { config } from "./config.js";

let debug = false
let isRunning = true
const infinity = 10000000
let roomEdges: WallEdge[]
let roomInsides: WallInside[]
const unitClasses = {
  drone: Drone,
  jumper: Jumper
}

const spawnEnemies = (units: { drone?: number, jumper?: number }, spawnAreas: Rectangle[]) => {
  const wallDistance = 35
  const canvasW = 1400
  const canvasH = 800
  let iterations = 0
  let blue = true
  for (const [name, count] of Object.entries(units)) {
    const UnitClass = unitClasses[name as keyof typeof unitClasses]
    for (let i = 0; i < count; i++) {
      if (iterations > 1000) { break }
      iterations++
      const randX = ~~(Math.random() * canvasW)
      const randY = ~~(Math.random() * canvasH)
      const pos = new Point(randX, randY)
      if (!spawnAreas.some(a => a.pointCollision(pos))) {
        i--
        continue
      }
      const c = new Circle(pos, wallDistance)
      let isColliding = false
      if (room.circleCollision(c, true)) {
        i--
        continue
      }
      for (let j = 0; j < Enemy.enemies.length; j++) {
        if (iterations > 1000) { break }
        if (Enemy.enemies[j].hitbox.circleCollision(c)) {
          i--
          isColliding = true
          break
        }
      }
      if (isColliding) { continue }
      new UnitClass(c.center, blue ? 'blue' : 'purple')
      blue = !blue
    }
  }
}

const onRoomChange = (roomNumber: number, pos?: Point) => {
  Projectile.playerProjectiles.length = 0
  Projectile.enemyProjectiles.length = 0
  Enemy.enemies.length = 0
  player.stop()
  player.pos = new Point(-1, -1)
  room.loadRoom(roomNumber)
  player.pos = pos ?? room.spawnPoint
  roomEdges = room.edges
  roomInsides = room.insides
  renderRoom(roomInsides)
  renderUi({
    score: 123456789,
    lifes: config.lifesAtStart,
    room: roomNumber,
    level: 'black'
  })
  spawnEnemies(room.units, room.spawnAreas)
  if (debug) {
    renderRoomDebug(roomEdges.flatMap(a => a.vecs))
  }
}

const startRoom = 0
const player = new Player(new Point(-100, -100))
room.loadRoom(startRoom)
onRoomChange(startRoom)

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
events.onAction('editor', () => {
  if (!editor.isEnabled()) {
    Projectile.playerProjectiles.length = 0
    Projectile.enemyProjectiles.length = 0
    Enemy.enemies.length = 0
    player.stop()
    isRunning = false
    roomEdges = []
    roomInsides = []
    renderRoom([])
    renderRoomDebug([])
    renderDebug([])
    renderUnits([])
    editor.enable()
  }
})

editor.onUpdate(() => renderRoom(editor.getObjects()))


player.onRoomChange = onRoomChange

const gameLoop = () => {
  if (!isRunning) { return }
  player.update()
  for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
    Projectile.playerProjectiles[i].update()
  }
  for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
    Projectile.enemyProjectiles[i].update()
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
  for (let i = 0; i < Explosion.explosions.length; i++) {
    objects[index++] = Explosion.explosions[i]
  }
  renderUnits(objects)
  renderRoom(roomInsides)
  if (debug) {
    const objects: Drawable[] = [player.hitbox]
    let index = 1
    for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
      objects[index++] = Projectile.playerProjectiles[i].hitbox
      for (let j = 0; j < Projectile.playerProjectiles[i].debug.length; j++) {
        objects[index++] = Projectile.playerProjectiles[i].debug[j]
      }
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

//new Shadow(new Point(350, 350))
// new Drone(new Point(400, 400), 'blue')
// new Jumper(new Point(350, 300))
Enemy.enemies.sort(a => player.pos.calculateDistance(a.pos))
